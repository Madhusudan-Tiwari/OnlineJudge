const pool = require("../database/db");

const {
    compileCpp,
    runExecutable,
    cleanup
} = require("./executor");

function normalizeOutput(output) {
    return output.trim().split(/\s+/);
}

function outputsMatch(actual, expected) {
    return JSON.stringify(normalizeOutput(actual)) ===
           JSON.stringify(normalizeOutput(expected));
}

async function judgeSubmission(submission) {
    const compilation = await compileCpp(submission.code);

    if (!compilation.success) {
        return {
            status: "COMPILATION_ERROR",
            failed_test_case_id: null,
            error_details: compilation.output
        };
    }

    try {
        const result = await pool.query(
            `SELECT id, input, expected_output
             FROM test_cases
             WHERE problem_id = $1
             ORDER BY id`,
            [submission.problem_id]
        );

        const testCases = result.rows;

        for (const testCase of testCases) {
            const execution = await runExecutable(
                compilation.executablePath,
                testCase.input
            );

            if (execution.status !== "SUCCESS") {
                return {
                    status: execution.status,
                    failed_test_case_id: testCase.id,
                    error_details: execution.output
                };
            }

            if (!outputsMatch(
                execution.output,
                testCase.expected_output
            )) {
                return {
                    status: "WRONG_ANSWER",
                    failed_test_case_id: testCase.id,
                    error_details: null
                };
            }
        }

        return {
            status: "ACCEPTED",
            failed_test_case_id: null,
            error_details: null
        };
    } finally {
        cleanup(
            compilation.sourcePath,
            compilation.executablePath
        );
    }
}

module.exports = judgeSubmission;