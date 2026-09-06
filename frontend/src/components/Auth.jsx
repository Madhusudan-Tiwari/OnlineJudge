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
            [event.target.name]:
                event.target.value
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

                setMessage("Login successful!");

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
        <div>
            <h1>Online Judge</h1>

            <button
                onClick={() => {
                    setMode("login");
                    setMessage("");
                }}
            >
                Login
            </button>

            <button
                onClick={() => {
                    setMode("register");
                    setMessage("");
                }}
            >
                Register
            </button>

            <h2>
                {mode === "login"
                    ? "Login"
                    : "Register"}
            </h2>

            <form onSubmit={handleSubmit}>

                {mode === "register" && (
                    <>
                        <input
                            name="username"
                            placeholder="Username"
                            value={form.username}
                            onChange={handleChange}
                        />

                        <br />
                    </>
                )}

                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                />

                <br />

                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                />

                <br />

                <button type="submit">
                    {mode === "login"
                        ? "Login"
                        : "Register"}
                </button>

            </form>

            <p>{message}</p>
        </div>
    );
}

export default Auth;