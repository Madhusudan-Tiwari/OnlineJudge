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
            <div className="page-header">
                <div>
                    <h1>Problems</h1>
                    <p>
                        Practice programming problems
                        and submit your solutions.
                    </p>
                </div>
            </div>

            {problems.length === 0 ? (
                <p>No problems available.</p>
            ) : (
                <div className="problem-list">
                    {problems.map((problem) => {
                        const difficulty =
                            problem.difficulty?.toLowerCase();

                        return (
                            <div
                                className="problem-card"
                                key={problem.id}
                            >
                                <div className="problem-info">
                                    <h3>
                                        {problem.title}
                                    </h3>

                                    <p
                                        className={`difficulty ${difficulty}`}
                                    >
                                        {problem.difficulty}
                                    </p>
                                </div>

                                <button
                                    className="primary-button"
                                    onClick={() =>
                                        onSelectProblem(
                                            problem
                                        )
                                    }
                                >
                                    Solve
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default ProblemList;