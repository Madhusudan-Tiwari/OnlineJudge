const {
    runDocker
} = require("./dockerExecutor");

async function test() {
    const code = `
int main() {
    while (true) {}
}
`;

    const testCases = [
        {
            id: 1,
            input: "10 25\\n",
            expectedOutput: "35"
        },
        {
            id: 2,
            input: "100 200\\n",
            expectedOutput: "300"
        },
        {
            id: 3,
            input: "-5 8\\n",
            expectedOutput: "3"
        }
    ];

    const result = await runDocker(
        code,
        testCases
    );

    console.log(JSON.stringify(result, null, 2));
}

test();