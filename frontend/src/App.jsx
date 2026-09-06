import { useState } from "react";
import SubmissionDetails from "./components/SubmissionDetails";
import Auth from "./components/Auth";
import ProblemList from "./components/ProblemList";
import ProblemPage from "./components/ProblemPage";
import SubmissionHistory from "./components/SubmissionHistory";

function App() {
    const [loggedIn, setLoggedIn] = useState(
        Boolean(localStorage.getItem("token"))
    );

    const [selectedProblem, setSelectedProblem] =
        useState(null);

    const [showSubmissions, setShowSubmissions] =
        useState(false);
    const [selectedSubmission, setSelectedSubmission] =
        useState(null);

    function handleLogin() {
        setLoggedIn(true);
    }

    function logout() {
        localStorage.removeItem("token");

        setLoggedIn(false);
        setSelectedProblem(null);
        setShowSubmissions(false);
    }

    if (!loggedIn) {
        return <Auth onLogin={handleLogin} />;
    }

    if (selectedProblem) {
        return (
            <ProblemPage
                problem={selectedProblem}
                onBack={() => setSelectedProblem(null)}
            />
        );
    }

    if (selectedSubmission) {
        return (
            <SubmissionDetails
                submissionId={selectedSubmission}
                onBack={() => setSelectedSubmission(null)}
            />
        );
    }

    if (showSubmissions) {
        return (
            <>
                <nav className="navbar">
                    <div className="navbar-brand">
                        Online Judge
                    </div>

                    <div className="navbar-actions">
                        <button
                            onClick={() =>
                                setShowSubmissions(false)
                            }
                        >
                            Problems
                        </button>

                        <button onClick={logout}>
                            Logout
                        </button>
                    </div>
                </nav>

                <main className="page">
                    <SubmissionHistory
                        onBack={() => setShowSubmissions(false)}
                        onSelectSubmission={setSelectedSubmission}
                    />
                </main>
            </>
        );
    }

    return (
        <>
            <nav className="navbar">
                <div className="navbar-brand">
                    Online Judge
                </div>

                <div className="navbar-actions">
                    <button
                        onClick={() =>
                            setShowSubmissions(true)
                        }
                    >
                        My Submissions
                    </button>

                    <button onClick={logout}>
                        Logout
                    </button>
                </div>
            </nav>

            <main className="page">
                <ProblemList
                    onSelectProblem={
                        setSelectedProblem
                    }
                />
            </main>
        </>
    );
}

export default App;