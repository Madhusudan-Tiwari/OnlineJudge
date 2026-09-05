const {
    runDocker
} = require("./dockerExecutor");

async function test() {
    const code = `
#include <iostream>

int main() {
    while (true) {}

    return 0;
}
`;

    const result = await runDocker(
        code,
        "10 25\n"
    );

    console.log(result);
}

test();