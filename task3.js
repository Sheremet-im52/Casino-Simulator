// Task 3: four eviction strategies.
const { memoize } = require("../src/memoize");
let computations = 0;
const square = (n) => { computations++; return n * n; };

async function main() {
    const lru = memoize(square, { maxSize: 2, policy: "lru" });
    console.log("LRU:", lru(2), lru(3), lru(2), lru(4));
    console.log("LRU cache (2 and 4):", lru.cacheInfo());

    const lfu = memoize(square, { maxSize: 2, policy: "lfu" });
    lfu(1); lfu(1); lfu(2); lfu(3);
    console.log("LFU cache (1 and 3):", lfu.cacheInfo());

    const ttl = memoize(square, { maxSize: 2, policy: "ttl", ttlMs: 40 });
    ttl(5);
    await new Promise((resolve) => setTimeout(resolve, 60));
    console.log("TTL cache after expiry:", ttl.cacheSize());

    const custom = memoize(square, {
        maxSize: 2, policy: "custom",
        customEvict: (entries) => entries[0].id // evict the first entry
    });
    custom(7); custom(8); custom(9);
    console.log("Custom cache (8 and 9):", custom.cacheInfo());
    console.log("Actual calculations:", computations);
}
main().catch(console.error);
