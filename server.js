const express = require("express")

const app = express();

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
app.listen(3000, () => {console.log("Server running on port 3000");});