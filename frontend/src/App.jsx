import { useState } from "react";

import Auth from "./components/Auth";
import ProblemList from "./components/ProblemList";
import ProblemPage from "./components/ProblemPage";
import SubmissionHistory
    from "./components/SubmissionHistory";

function App() {
    const [loggedIn, setLoggedIn] =
        useState(
            Boolean(
                localStorage.getItem("token")
            )
        );

    const [selectedProblem, setSelectedProblem] =
        useState(null);

    const [showSubmissions, setShowSubmissions] =
        useState(false);

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
        return (
            <Auth onLogin={handleLogin} />
        );
    }

    if (selectedProblem) {
        return (
            <ProblemPage
                problem={selectedProblem}
                onBack={() =>
                    setSelectedProblem(null)
                }
            />
        );
    }

    if (showSubmissions) {
        return (
            <SubmissionHistory
                onBack={() =>
                    setShowSubmissions(false)
                }
            />
        );
    }

    return (
        <div>
            <nav>
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
            </nav>

            <ProblemList
                onSelectProblem={
                    setSelectedProblem
                }
            />
        </div>
    );
}

export default App;