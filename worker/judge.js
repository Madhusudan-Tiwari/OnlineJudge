const pool = require("../database/db");
const { runDocker } = require("./dockerExecutor");

function normalizeOutput(output) {
    return output.trim().split(/\s+/);
}

function outputsMatch(actual, expected) {
    return JSON.stringify(normalizeOutput(actual)) ===
           JSON.stringify(normalizeOutput(expected));
}

async function judgeSubmission(submission) {
    const result = await pool.query(
        `SELECT id, input, expected_output
         FROM test_cases
         WHERE problem_id = $1
         ORDER BY id`,
        [submission.problem_id]
    );

    const testCases = result.rows;

    const dockerResult = await runDocker(
        submission.code,
        testCases
    );

    if (dockerResult.status === "COMPILATION_ERROR") {
        return {
            status: "COMPILATION_ERROR",
            failed_test_case_id: null,
            error_details: dockerResult.error,
            execution_time_ms: null
        };
    }

    if (
        dockerResult.status === "TIME_LIMIT_EXCEEDED" ||
        dockerResult.status === "MEMORY_LIMIT_EXCEEDED" ||
        dockerResult.status === "RUNTIME_ERROR"
    ) {
        return {
            status: dockerResult.status,
            failed_test_case_id: null,
            error_details: dockerResult.error,
            execution_time_ms: null
        };
    }

    let totalExecutionTimeMs = 0;
    let maxMemoryUsedKb = 0;

    for (const testCase of testCases) {
        const execution = dockerResult.results.find(
            result => result.id === testCase.id
        );

        if (!execution) {
            return {
                status: "RUNTIME_ERROR",
                failed_test_case_id: testCase.id,
                error_details: "No execution result returned",
                execution_time_ms: totalExecutionTimeMs
            };
        }

        totalExecutionTimeMs += execution.execution_time_ms;

        const memoryUsedKb = Number(execution.memory_used_kb);

        if (Number.isFinite(memoryUsedKb)) {
            maxMemoryUsedKb = Math.max(
                maxMemoryUsedKb,
                memoryUsedKb
            );
        }

        if (execution.status !== "SUCCESS") {
            return {
                status: execution.status,
                failed_test_case_id: testCase.id,
                error_details: execution.error,
                execution_time_ms: totalExecutionTimeMs,
                memory_used_kb: maxMemoryUsedKb > 0
                    ? maxMemoryUsedKb
                    : null
            };
        }

        if (
            !outputsMatch(
                execution.output,
                testCase.expected_output
            )
        ) {
            return {
                status: "WRONG_ANSWER",
                failed_test_case_id: testCase.id,
                error_details: null,
                execution_time_ms: totalExecutionTimeMs,
                memory_used_kb: maxMemoryUsedKb > 0
                    ? maxMemoryUsedKb
                    : null
            };
        }
    }

    return {
        status: "ACCEPTED",
        failed_test_case_id: null,
        error_details: null,
        execution_time_ms: totalExecutionTimeMs,
        memory_used_kb: maxMemoryUsedKb > 0
            ? maxMemoryUsedKb
            : null
    };
}

module.exports = judgeSubmission;