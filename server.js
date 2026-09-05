const express = require("express");
const pool = require("./database/db");

const app = express();
app.use(express.json());

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

app.post("/submissions", async (req, res) =>
    {
        try
        {
            const { user_id, problem_id, code, language } = req.body;

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


app.listen(3000, () => { console.log("Server running on port 3000"); });