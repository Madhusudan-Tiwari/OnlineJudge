const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");

function runDocker(sourceCode, testCases) {
    return new Promise((resolve) => {
        const id = `${Date.now()}_${Math.random()
            .toString(36)
            .slice(2)}`;

        const sourcePath = path.join(
            os.tmpdir(),
            `submission_${id}.cpp`
        );

        const testsPath = path.join(
            os.tmpdir(),
            `tests_${id}.json`
        );

        fs.writeFileSync(sourcePath, sourceCode);

        const inputs = testCases.map(testCase => ({
            id: testCase.id,
            input: testCase.input
        }));

        fs.writeFileSync(
            testsPath,
            JSON.stringify(inputs)
        );

        const dockerArgs = [
            "run",
            "--rm",
            "-i",

            "--cpus=1",
            "--memory=256m",
            "--memory-swap=256m",
            "--pids-limit=64",

            "--network=none",

            "--read-only",

            "--tmpfs",
            "/tmp:rw,exec,nosuid,size=64m",

            "-v",
            `${sourcePath}:/input/main.cpp:ro`,

            "-v",
            `${testsPath}:/input/tests.json:ro`,

            "gcc:latest",

            "bash",
            "-c",
            `
            g++ /input/main.cpp -o /tmp/main 2>/tmp/compile_error

            if [ $? -ne 0 ]; then
                cat /tmp/compile_error
                exit 100
            fi

            python3 - <<'PY'
import json
import subprocess
import time

with open("/input/tests.json", "r") as f:
    tests = json.load(f)

results = []

for test in tests:

    start = time.monotonic()

    try:
        process = subprocess.run(
            ["/tmp/main"],
            input=test["input"],
            text=True,
            capture_output=True,
            timeout=2
        )

        execution_time_ms = int(
            (time.monotonic() - start) * 1000
        )

        if process.returncode == 0:
            status = "SUCCESS"
        else:
            status = "RUNTIME_ERROR"

        results.append({
            "id": test["id"],
            "status": status,
            "output": process.stdout,
            "error": process.stderr,
            "execution_time_ms": execution_time_ms,
            "exit_code": process.returncode
        })

    except subprocess.TimeoutExpired as e:

        results.append({
            "id": test["id"],
            "status": "TIME_LIMIT_EXCEEDED",
            "output": e.stdout or "",
            "error": "Execution time exceeded",
            "execution_time_ms": 2000,
            "exit_code": None
        })

        break

print(json.dumps(results))
PY
            `
        ];

        const child = spawn(
            "docker",
            dockerArgs
        );

        let output = "";
        let error = "";
        let finished = false;

        const timeout = setTimeout(() => {
            if (finished) {
                return;
            }

            finished = true;

            child.kill("SIGKILL");

            cleanup(sourcePath, testsPath);

            resolve({
                status: "TIME_LIMIT_EXCEEDED",
                results: [],
                error: "Docker execution exceeded time limit"
            });
        }, 15000);

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

            cleanup(sourcePath, testsPath);

            resolve({
                status: "RUNTIME_ERROR",
                results: [],
                error: err.message
            });
        });

        child.on("close", (code) => {
            if (finished) {
                return;
            }

            finished = true;

            clearTimeout(timeout);

            cleanup(sourcePath, testsPath);

            if (code === 0) {
                try {
                    const results = JSON.parse(
                        output.trim()
                    );

                    resolve({
                        status: "SUCCESS",
                        results,
                        error
                    });
                } catch (parseError) {
                    resolve({
                        status: "RUNTIME_ERROR",
                        results: [],
                        error:
                            "Invalid sandbox output: " +
                            parseError.message
                    });
                }
            } else if (code === 100) {
                resolve({
                    status: "COMPILATION_ERROR",
                    results: [],
                    error: output || error
                });
            } else if (code === 137) {
                resolve({
                    status: "MEMORY_LIMIT_EXCEEDED",
                    results: [],
                    error: error || output
                });
            } else {
                resolve({
                    status: "RUNTIME_ERROR",
                    results: [],
                    error: error || output,
                    exitCode: code
                });
            }
        });

        child.stdin.end();
    });
}

function cleanup(sourcePath, testsPath) {
    if (fs.existsSync(sourcePath)) {
        fs.unlinkSync(sourcePath);
    }

    if (fs.existsSync(testsPath)) {
        fs.unlinkSync(testsPath);
    }
}

module.exports = {
    runDocker
};