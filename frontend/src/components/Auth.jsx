import { useState } from "react";
import {
    login,
    register
} from "../api";

function Auth({ onLogin }) {
    const [mode, setMode] = useState("login");

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");

    function handleChange(event) {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setMessage("Loading...");

        try {
            if (mode === "login") {
                const data = await login(
                    form.email,
                    form.password
                );

                localStorage.setItem(
                    "token",
                    data.token
                );

                onLogin();
            } else {
                await register(
                    form.username,
                    form.email,
                    form.password
                );

                setMessage(
                    "Registration successful! You can now login."
                );

                setMode("login");

                setForm({
                    username: "",
                    email: "",
                    password: ""
                });
            }
        } catch (error) {
            console.error(error);
            setMessage(error.message);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Online Judge</h1>

                <div className="auth-tabs">
                    <button
                        className={
                            mode === "login"
                                ? "active"
                                : ""
                        }
                        onClick={() => {
                            setMode("login");
                            setMessage("");
                        }}
                    >
                        Login
                    </button>

                    <button
                        className={
                            mode === "register"
                                ? "active"
                                : ""
                        }
                        onClick={() => {
                            setMode("register");
                            setMessage("");
                        }}
                    >
                        Register
                    </button>
                </div>

                <h2>
                    {mode === "login"
                        ? "Welcome back"
                        : "Create account"}
                </h2>

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >
                    {mode === "register" && (
                        <input
                            name="username"
                            placeholder="Username"
                            value={form.username}
                            onChange={handleChange}
                        />
                    )}

                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                    />

                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                    />

                    <button
                        className="primary-button"
                        type="submit"
                    >
                        {mode === "login"
                            ? "Login"
                            : "Create Account"}
                    </button>
                </form>

                <p className="auth-message">
                    {message}
                </p>
            </div>
        </div>
    );
}

export default Auth;