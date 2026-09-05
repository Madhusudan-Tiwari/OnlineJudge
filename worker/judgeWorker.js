const pool = require("../database/db");

async function getNextSubmission() {
    const result = await pool.query(`
        UPDATE submissions
        SET status = 'COMPILING'
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

async function worker() {
    console.log("Judge worker started");

    while (true) {
        try {
            const submission = await getNextSubmission();

            if (submission) {
                console.log(
                    `Picked submission #${submission.id}`
                );

                // Actual judging will be added here.
            } else {
                await new Promise(resolve =>
                    setTimeout(resolve, 1000)
                );
            }
        } catch (error) {
            console.error("Worker error:", error.message);
        }
    }
}

worker();