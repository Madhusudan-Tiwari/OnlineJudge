const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");

function runDocker(sourceCode, input) {
    return new Promise((resolve) => {
        const fileName = `submission_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2)}.cpp`;

        const sourcePath = path.join(
            os.tmpdir(),
            fileName
        );

        fs.writeFileSync(sourcePath, sourceCode);

        const dockerArgs = [
            "run",
            "--rm",
            "-i",

            // Limit container to one CPU
            "--cpus=1",

            // Mount source code as read-only
            "-v",
            `${sourcePath}:/tmp/main.cpp:ro`,

            "gcc:latest",

            "bash",
            "-c",
            `
            g++ /tmp/main.cpp -o /tmp/main 2>/tmp/compile_error

            if [ $? -ne 0 ]; then
                cat /tmp/compile_error
                exit 100
            fi

            /tmp/main
            `
        ];

        const child = spawn("docker", dockerArgs);

        let output = "";
        let error = "";
        let finished = false;

        const timeout = setTimeout(() => {
            if (finished) {
                return;
            }

            finished = true;

            child.kill("SIGKILL");

            cleanup(sourcePath);

            resolve({
                status: "TIME_LIMIT_EXCEEDED",
                output,
                error: "Execution time exceeded",
                exitCode: null
            });
        }, 2000);

        child.stdout.on("data", (data) => {
            output += data.toString();
        });

        child.stderr.on("data", (data) => {
            error += data.toString();
        });

        child.on("error", (err) => {
            if (finished) {
                return;
            }

            finished = true;

            clearTimeout(timeout);
            cleanup(sourcePath);

            resolve({
                status: "RUNTIME_ERROR",
                output: "",
                error: err.message,
                exitCode: null
            });
        });

        child.on("close", (code) => {
            if (finished) {
                return;
            }

            finished = true;

            clearTimeout(timeout);
            cleanup(sourcePath);

            if (code === 0) {
                resolve({
                    status: "SUCCESS",
                    output,
                    error,
                    exitCode: code
                });
            } else if (code === 100) {
                resolve({
                    status: "COMPILATION_ERROR",
                    output,
                    error,
                    exitCode: code
                });
            } else {
                resolve({
                    status: "RUNTIME_ERROR",
                    output,
                    error,
                    exitCode: code
                });
            }
        });

        child.stdin.write(input);
        child.stdin.end();
    });
}

function cleanup(sourcePath) {
    if (fs.existsSync(sourcePath)) {
        fs.unlinkSync(sourcePath);
    }
}

module.exports = {
    runDocker
};