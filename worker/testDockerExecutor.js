const {
    runDocker
} = require("./dockerExecutor");

async function test() {
    const code = `
#include <iostream>

int main() {
    int a, b;
    std::cin >> a >> b;

    std::cout << a + b;

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