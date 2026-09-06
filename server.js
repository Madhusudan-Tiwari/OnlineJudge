const express = require("express");
const pool = require("./database/db");
const authRouter = require("./auth/auth");
const authenticateToken = require("./middleware/authMiddleware");
const cors = require("cors");
const { spawn } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/auth", authRouter);

app.get("/problems", async (req, res) =>
    {
        try
        {
            const result = await pool.query("SELECT * FROM problems ORDER BY id");
            res.json(result.rows);
        }
        catch (error)
        {
            console.error(error);
            res.status(500).json({error: "Database error"});
        }
    });

app.post("/submissions", authenticateToken, async (req, res) =>
    {
        try
        {
            const { problem_id, code, language } = req.body;

            const user_id = req.user.userId;

            const result = await pool.query
            (
                `INSERT INTO submissions
                (user_id, problem_id, code, language, status)
                VALUES ($1, $2, $3, $4, 'PENDING')
                RETURNING *`,
                [user_id, problem_id, code, language]
            );

            res.status(201).json(result.rows[0]);
        }
        catch (error)
        {
            console.error(error);
            res.status(500).json({error: "Failed to create submission"});
        }
    });


app.get("/submissions", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT
                submissions.id,
                submissions.problem_id,
                problems.title AS problem_title,
                submissions.language,
                submissions.status,
                submissions.error_details,
                submissions.failed_test_case_id,
                submissions.execution_time_ms,
                submissions.memory_used_kb,
                submissions.submitted_at
             FROM submissions
             JOIN problems
               ON submissions.problem_id = problems.id
             WHERE submissions.user_id = $1
             ORDER BY submissions.submitted_at DESC`,
            [userId]
        );

        res.json(result.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Database error"
        });
    }
});

app.get("/submissions/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT
                submissions.id,
                submissions.problem_id,
                problems.title AS problem_title,
                submissions.code,
                submissions.language,
                submissions.status,
                submissions.error_details,
                submissions.failed_test_case_id,
                submissions.execution_time_ms,
                submissions.memory_used_kb,
                submissions.submitted_at,
                test_cases.input AS failed_test_input,
                test_cases.expected_output AS failed_test_expected_output
             FROM submissions
             JOIN problems
               ON submissions.problem_id = problems.id
             LEFT JOIN test_cases
               ON submissions.failed_test_case_id = test_cases.id
             WHERE submissions.id = $1
               AND submissions.user_id = $2`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Submission not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Database error"
        });
    }
});

const PORT = 3000;

const worker = spawn(
    process.execPath,
    ["worker/judgeWorker.js"],
    {
        stdio: "inherit"
    }
);

worker.on("error", (error) => {
    console.error("Failed to start judge worker:", error);
});

worker.on("exit", (code, signal) => {
    console.log(
        `Judge worker exited. code=${code}, signal=${signal}`
    );
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});