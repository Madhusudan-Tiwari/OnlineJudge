const express = require("express")

const app = express();
app.use(express.json());

const problems =
[
    {
        id: 1,
        title: "Two Sum",
        difficulty: "Easy"
    },
    {
        id: 2,
        title: "Binary Search",
        difficulty: "Easy"
    },
    {
        id: 3,
        title: "Dijkstra",
        difficulty: "Hard"
    }
];

app.get("/problems", (req, res) => {res.json(problems);});
app.post("/submissions", (req, res) => {console.log(req.body); res.json({message: "Submission received"});});
app.listen(3000, () => {console.log("Server running on port 3000");});