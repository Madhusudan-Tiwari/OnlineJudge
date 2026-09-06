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
            <button onClick={onBack}>
                ← Back to Problems
            </button>

            <h1>{problem.title}</h1>

            <p>
                Difficulty:{" "}
                {problem.difficulty}
            </p>

            <h2>Problem Statement</h2>

            <p>
                {problem.statement}
            </p>

            <h2>Constraints</h2>

            <p>
                {problem.constraints}
            </p>

            <h2>Code</h2>

            <textarea
                rows="20"
                cols="80"
                placeholder="Write your C++ code here..."
                value={code}
                onChange={(event) =>
                    setCode(event.target.value)
                }
            />

            <br />

            <button
                onClick={submitCode}
                disabled={submitting}
            >
                {submitting
                    ? "Judging..."
                    : "Submit"}
            </button>

            <p>{submitMessage}</p>
        </div>
    );
}

export default ProblemPage;