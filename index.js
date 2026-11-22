// Task 2: import the installed LOCAL package, not ../lib.
const { counterGenerator, weekdayGenerator, consumeWithTimeout } = require("casino-iterators-lib");

async function main() {
    console.log("Counter (1 second):");
    const first = await consumeWithTimeout(counterGenerator(10, 5), 1, console.log, 250);
    console.log(first);

    console.log("Weekdays (1 second):");
    const second = await consumeWithTimeout(weekdayGenerator(), 1, console.log, 250);
    console.log(second);
}

main().catch(console.error);
