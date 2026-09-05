const path = require("path");

const {
    runDockerTest
} = require("./dockerExecutor");

async function test() {
    const sourcePath = path.join(
        __dirname,
        "dockerTest.cpp"
    );

    const result = await runDockerTest(
        sourcePath,
        "10 25\n"
    );

    console.log(result);
}

test();