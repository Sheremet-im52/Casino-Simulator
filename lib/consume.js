// Task 1: a generic iterator consumer with a timeout in SECONDS.
function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function consumeWithTimeout(iterator, seconds, onValue = console.log, intervalMs = 200) {
    if (!iterator || typeof iterator.next !== "function") {
        throw new TypeError("First argument must have a next() method");
    }
    if (!Number.isFinite(seconds) || seconds < 0) {
        throw new RangeError("seconds must be a non-negative number");
    }
    if (!Number.isFinite(intervalMs) || intervalMs < 0) {
        throw new RangeError("intervalMs must be a non-negative number");
    }

    const end = Date.now() + seconds * 1000;
    let count = 0;

    while (Date.now() < end) {
        const result = iterator.next();
        if (result.done) {
            return { count, reason: "iterator-ended" };
        }

        await onValue(result.value); // callback may be sync or async
        count++;

        const remaining = end - Date.now();
        if (remaining <= 0) break;
        await wait(Math.min(intervalMs, remaining));
    }

    return { count, reason: "timeout" };
}

module.exports = { consumeWithTimeout, wait };
