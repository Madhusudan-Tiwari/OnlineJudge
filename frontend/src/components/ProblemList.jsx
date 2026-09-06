import { useEffect, useState } from "react";
import { getProblems } from "../api";

function ProblemList({ onSelectProblem }) {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        loadProblems();
    }, []);

    async function loadProblems() {
        try {
            setLoading(true);

            const data = await getProblems();

            setProblems(data);

        } catch (error) {
            console.error(error);

            setMessage(error.message);

        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <p>Loading problems...</p>;
    }

    if (message) {
        return <p>{message}</p>;
    }

    return (
        <div>
            <h1>Problems</h1>

            {problems.length === 0 ? (
                <p>No problems available.</p>
            ) : (
                problems.map((problem) => (
                    <div key={problem.id}>
                        <button
                            onClick={() =>
                                onSelectProblem(problem)
                            }
                        >
                            {problem.title}
                        </button>

                        <p>
                            Difficulty:{" "}
                            {problem.difficulty}
                        </p>
                    </div>
                ))
            )}
        </div>
    );
}

export default ProblemList;