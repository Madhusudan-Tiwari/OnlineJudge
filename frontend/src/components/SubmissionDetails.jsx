import { useEffect, useState } from "react";
import { getSubmission } from "../api";

function SubmissionDetails({ submissionId, onBack }) {
    const [submission, setSubmission] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadSubmission() {
            try {
                const data = await getSubmission(submissionId);
                setSubmission(data);
            } catch (err) {
                setError(err.message);
            }
        }

        loadSubmission();
    }, [submissionId]);

    if (error) {
        return (
            <div className="page submission-details-page">
                <button onClick={onBack}>← Back</button>
                <p>{error}</p>
            </div>
        );
    }

    if (!submission) {
        return (
            <div className="page submission-details-page">
                <p>Loading submission...</p>
            </div>
        );
    }

    return (
        <div className="page submission-details-page">

            <button onClick={onBack}>
                ← Back to submissions
            </button>

            <div className="submission-details">

                <h1>{submission.problem_title}</h1>

                <p>Submission #{submission.id}</p>

                <div className="submission-meta">

                    <div>
                        <strong>Status</strong>
                        <span className={`status-${submission.status}`}>
                            {submission.status.replaceAll("_", " ")}
                        </span>
                    </div>

                    <div>
                        <strong>Language</strong>
                        <span>{submission.language}</span>
                    </div>

                    <div>
                        <strong>Execution Time</strong>
                        <span>
                            {submission.execution_time_ms !== null
                                ? `${submission.execution_time_ms} ms`
                                : "N/A"}
                        </span>
                    </div>

                    <div>
                        <strong>Memory Used</strong>
                        <span>
                            {submission.memory_used_kb !== null
                                ? `${(submission.memory_used_kb / 1024).toFixed(2)} MB`
                                : "N/A"}
                        </span>
                    </div>

                </div>

                {submission.failed_test_case_id && (
                    <div className="failed-test-case">

                        <h2>
                            Failed Test Case #{submission.failed_test_case_id}
                        </h2>

                        <div className="test-case-section">
                            <h3>Input</h3>

                            <pre>
                                {submission.failed_test_input}
                            </pre>
                        </div>

                        <div className="test-case-section">
                            <h3>Expected Output</h3>

                            <pre>
                                {submission.failed_test_expected_output}
                            </pre>
                        </div>

                    </div>
                )}

                {submission.error_details && (
                    <div className="submission-error">

                        <h3>Error</h3>

                        <pre>
                            {submission.error_details}
                        </pre>

                    </div>
                )}

                <h2>Submitted Code</h2>

                <pre className="code-block">
                    <code>{submission.code}</code>
                </pre>

            </div>
        </div>
    );
}

export default SubmissionDetails;