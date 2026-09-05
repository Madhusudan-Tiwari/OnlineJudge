const { spawn } = require("child_process");
const path = require("path");

function runDockerTest(sourcePath, input) {
    return new Promise((resolve) => {
        const containerSourcePath = "/tmp/main.cpp";

        const dockerArgs = [
            "run",
            "--rm",
            "-i",

            "-v",
            `${path.resolve(sourcePath)}:${containerSourcePath}:ro`,

            "gcc:latest",

            "bash",
            "-c",
            `g++ ${containerSourcePath} -o /tmp/main && /tmp/main`
        ];

        const child = spawn("docker", dockerArgs);

        let output = "";
        let error = "";

        child.stdout.on("data", (data) => {
            output += data.toString();
        });

        child.stderr.on("data", (data) => {
            error += data.toString();
        });

        child.on("error", (err) => {
            resolve({
                success: false,
                output: "",
                error: err.message
            });
        });

        child.on("close", (code) => {
            resolve({
                success: code === 0,
                output,
                error,
                exitCode: code
            });
        });

        child.stdin.write(input);
        child.stdin.end();
    });
}

module.exports = {
    runDockerTest
};