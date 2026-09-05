const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

function runCpp(sourceCode, input = "") {
    return new Promise((resolve) => {
        const fileName = `submission_${Date.now()}`;
        const sourcePath = path.join(__dirname, `${fileName}.cpp`);
        const executablePath = path.join(__dirname, `${fileName}.exe`);

        fs.writeFileSync(sourcePath, sourceCode);

        execFile(
            "g++",
            [sourcePath, "-o", executablePath],
            (compileError, stdout, stderr) => {
                if (compileError) {
                    cleanup(sourcePath, executablePath);

                    resolve({
                        status: "COMPILATION_ERROR",
                        output: stderr
                    });

                    return;
                }

                execFile(
                    executablePath,
                    (runtimeError, stdout, stderr) => {
                        cleanup(sourcePath, executablePath);

                        if (runtimeError) {
                            resolve({
                                status: "RUNTIME_ERROR",
                                output: stderr
                            });

                            return;
                        }

                        resolve({
                            status: "SUCCESS",
                            output: stdout
                        });
                    }
                );
            }
        );
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

module.exports = runCpp;