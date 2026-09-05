const fs = require("fs");
const path = require("path");
const { execFile, spawn } = require("child_process");

function compileCpp(sourceCode) {
    return new Promise((resolve) => {
        const fileName = `submission_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2)}`;

        const sourcePath = path.join(
            __dirname,
            `${fileName}.cpp`
        );

        const executablePath = path.join(
            __dirname,
            `${fileName}.exe`
        );

        fs.writeFileSync(sourcePath, sourceCode);

        execFile(
            "g++",
            [sourcePath, "-o", executablePath],
            (compileError, stdout, stderr) => {
                if (compileError) {
                    cleanup(sourcePath, executablePath);

                    resolve({
                        success: false,
                        status: "COMPILATION_ERROR",
                        output: stderr
                    });

                    return;
                }

                resolve({
                    success: true,
                    executablePath,
                    sourcePath
                });
            }
        );
    });
}

function runExecutable(
    executablePath,
    input = "",
    timeLimitMs = 2000
) {
    return new Promise((resolve) => {
        const child = spawn(executablePath, [], {
            cwd: __dirname
        });

        let programOutput = "";
        let programError = "";
        let timedOut = false;

        const timer = setTimeout(() => {
            timedOut = true;
            child.kill();
        }, timeLimitMs);

        child.stdout.on("data", (data) => {
            programOutput += data.toString();
        });

        child.stderr.on("data", (data) => {
            programError += data.toString();
        });

        child.on("error", (error) => {
            clearTimeout(timer);

            resolve({
                status: "RUNTIME_ERROR",
                output: error.message
            });
        });

        child.on("close", (code) => {
            clearTimeout(timer);

            if (timedOut) {
                resolve({
                    status: "TIME_LIMIT_EXCEEDED",
                    output: "Execution time limit exceeded"
                });

                return;
            }

            if (code !== 0) {
                resolve({
                    status: "RUNTIME_ERROR",
                    output: programError
                });

                return;
            }

            resolve({
                status: "SUCCESS",
                output: programOutput
            });
        });

        child.stdin.write(input);
        child.stdin.end();
    });
}

function cleanup(sourcePath, executablePath) {
    if (fs.existsSync(sourcePath)) {
        fs.unlinkSync(sourcePath);
    }

    if (fs.existsSync(executablePath)) {
        fs.unlinkSync(executablePath);
    }
}

module.exports = {
    compileCpp,
    runExecutable,
    cleanup
};