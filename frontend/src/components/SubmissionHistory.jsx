import { useEffect, useState } from "react";
import { getSubmissions } from "../api";

function SubmissionHistory({ onBack, onSelectSubmission }) {
    const [submissions, setSubmissions] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [message, setMessage] =
        useState("");

    useEffect(() => {
        loadSubmissions();
    }, []);

    async function loadSubmissions() {
        try {
            setLoading(true);

            const data =
                await getSubmissions();

            setSubmissions(data);
        } catch (error) {
            console.error(error);
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <p>Loading submissions...</p>;
    }

    if (message) {
        return <p>{message}</p>;
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>My Submissions</h1>
                    <p>
                        View your previous submissions
                        and their results.
                    </p>
                </div>
            </div>

            {submissions.length === 0 ? (
                <p>No submissions yet.</p>
            ) : (
                <div className="submission-table-container">
                    <table className="submission-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Problem</th>
                                <th>Language</th>
                                <th>Status</th>
                                <th>Time</th>
                            </tr>
                        </thead>

                        <tbody>
                            {submissions.map(
                                (submission) => (
                                    <tr
                                        key={submission.id}
                                        onClick={() => onSelectSubmission(submission.id)}
                                        className="submission-row"
                                    >
                                        <td>
                                            #
                                            {
                                                submission.id
                                            }
                                        </td>

                                        <td>
                                            {
                                                submission.problem_title
                                            }
                                        </td>

                                        <td>
                                            {submission.language.toUpperCase()}
                                        </td>

                                        <td
                                            className={`status ${submission.status}`}
                                        >
                                            {
                                                submission.status
                                            }
                                        </td>

                                        <td>
                                            {
                                                submission.execution_time_ms ??
                                                "-"
                                            }{" "}
                                            ms
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default SubmissionHistory;