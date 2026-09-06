const pool = require("../database/db");
const judgeSubmission = require("./judge");

async function getNextSubmission() {
    const result = await pool.query(`
        UPDATE submissions
        SET
            status = 'RUNNING',
            started_at = CURRENT_TIMESTAMP
        WHERE id = (
            SELECT id
            FROM submissions
            WHERE status = 'PENDING'
            ORDER BY submitted_at
            LIMIT 1
            FOR UPDATE SKIP LOCKED
        )
        RETURNING *
    `);

    return result.rows[0];
}

async function updateSubmission(submissionId, result) {
    await pool.query(
        `UPDATE submissions
        SET status = $1,
            error_details = $2,
            failed_test_case_id = $3,
            execution_time_ms = $4,
            started_at = NULL
        WHERE id = $5`,
        [
            result.status,
            result.error_details,
            result.failed_test_case_id,
            result.execution_time_ms,
            submissionId
        ]
    );
}

async function recoverStaleSubmissions() {
    const result = await pool.query(`
        UPDATE submissions
        SET
            status = 'PENDING',
            started_at = NULL
        WHERE status = 'RUNNING'
          AND started_at < CURRENT_TIMESTAMP - INTERVAL '30 seconds'
        RETURNING id
    `);

    for (const submission of result.rows) {
        console.log(
            `Recovered stale submission #${submission.id}`
        );
    }
}

async function worker() {
    console.log("Judge worker started");

    while (true) {
        try {
            await recoverStaleSubmissions();
            
            const submission = await getNextSubmission();

            if (submission) {
                console.log(
                    `Picked submission #${submission.id}`
                );

                const result = await judgeSubmission(submission);

                await updateSubmission(
                    submission.id,
                    result
                );

                console.log(
                    `Submission #${submission.id}: ${result.status}`
                );
            } else {
                await new Promise(resolve =>
                    setTimeout(resolve, 1000)
                );
            }
        } catch (error) {
            console.error(
                "Worker error:",
                error.message
            );
        }
    }
}

worker();