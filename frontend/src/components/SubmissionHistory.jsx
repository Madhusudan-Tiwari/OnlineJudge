import { useEffect, useState } from "react";
import { getSubmissions } from "../api";

function SubmissionHistory({
    onBack
}) {
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
        return (
            <div>
                <button onClick={onBack}>
                    ← Back
                </button>

                <p>{message}</p>
            </div>
        );
    }

    return (
        <div>
            <button onClick={onBack}>
                ← Back to Problems
            </button>

            <h1>My Submissions</h1>

            {submissions.length === 0 ? (
                <p>No submissions yet.</p>
            ) : (
                <table>
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
                                    key={
                                        submission.id
                                    }
                                >
                                    <td>
                                        #
                                        {
                                            submission.id
                                        }
                                    </td>

                                    <td>
                                        {submission.problem_title}
                                    </td>

                                    <td>
                                        {
                                            submission.language
                                        }
                                    </td>

                                    <td>
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
            )}
        </div>
    );
}

export default SubmissionHistory;