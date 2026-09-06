import { useState } from "react";
import {
    createSubmission,
    getSubmission
} from "../api";

function ProblemPage({
    problem,
    onBack
}) {
    const [code, setCode] = useState("");
    const [submitMessage, setSubmitMessage] =
        useState("");

    const [submitting, setSubmitting] =
        useState(false);

    async function submitCode() {
        if (!code.trim()) {
            setSubmitMessage(
                "Please enter some code before submitting."
            );
            return;
        }

        setSubmitting(true);
        setSubmitMessage("Submitting...");

        try {
            const submission =
                await createSubmission(
                    problem.id,
                    code,
                    "cpp"
                );

            setSubmitMessage(
                `Submission #${submission.id}: PENDING...`
            );

            await pollSubmission(
                submission.id
            );
        } catch (error) {
            console.error(error);
            setSubmitMessage(error.message);
        } finally {
            setSubmitting(false);
        }
    }

    async function pollSubmission(
        submissionId
    ) {
        while (true) {
            try {
                const data =
                    await getSubmission(
                        submissionId
                    );

                if (
                    data.status !== "PENDING" &&
                    data.status !== "RUNNING"
                ) {
                    setSubmitMessage(
                        `Submission #${submissionId}: ${data.status}`
                    );

                    return;
                }

                setSubmitMessage(
                    `Submission #${submissionId}: ${data.status}...`
                );

                await new Promise(
                    (resolve) =>
                        setTimeout(
                            resolve,
                            1000
                        )
                );
            } catch (error) {
                console.error(error);

                setSubmitMessage(
                    error.message
                );

                return;
            }
        }
    }

    return (
        <div>
            <nav className="navbar">
                <div className="navbar-brand">
                    Online Judge
                </div>

                <div className="navbar-actions">
                    <button onClick={onBack}>
                        Problems
                    </button>
                </div>
            </nav>

            <div className="problem-layout">
                <section className="problem-description">
                    <button
                        className="back-button"
                        onClick={onBack}
                    >
                        ← Back to Problems
                    </button>

                    <h1>{problem.title}</h1>

                    <p
                        className={`difficulty ${problem.difficulty?.toLowerCase()}`}
                    >
                        {problem.difficulty}
                    </p>

                    <h2>
                        Problem Statement
                    </h2>

                    <p>
                        {problem.statement}
                    </p>

                    <h2>Constraints</h2>

                    <p>
                        {problem.constraints}
                    </p>
                </section>

                <section className="editor-section">
                    <div className="editor-header">
                        <h2>C++</h2>
                    </div>

                    <textarea
                        className="editor"
                        placeholder="Write your C++ code here..."
                        value={code}
                        onChange={(event) =>
                            setCode(
                                event.target.value
                            )
                        }
                    />

                    <div className="submit-section">
                        <button
                            className="primary-button"
                            onClick={submitCode}
                            disabled={submitting}
                        >
                            {submitting
                                ? "Judging..."
                                : "Submit"}
                        </button>

                        <p className="submit-message">
                            {submitMessage}
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default ProblemPage;