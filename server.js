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

app.post("/submissions", (req, res) => { console.log(req.body); res.json({ message: "Submission received" }); });
app.listen(3000, () => { console.log("Server running on port 3000"); });