const API_URL = "http://localhost:3000";

export async function login(email, password) {
    const response = await fetch(
        `${API_URL}/auth/login`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Login failed"
        );
    }

    return data;
}

export async function register(
    username,
    email,
    password
) {
    const response = await fetch(
        `${API_URL}/auth/register`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Registration failed"
        );
    }

    return data;
}

export async function getProblems() {
    const response = await fetch(
        `${API_URL}/problems`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to load problems"
        );
    }

    return data;
}

export async function createSubmission(
    problemId,
    code,
    language
) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/submissions`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                problem_id: problemId,
                code,
                language
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Submission failed"
        );
    }

    return data;
}

export async function getSubmission(
    submissionId
) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/submissions/${submissionId}`,
        {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
            "Failed to get submission"
        );
    }

    return data;
}

export async function getSubmissions() {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/submissions`,
        {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
            "Failed to load submissions"
        );
    }

    return data;
}