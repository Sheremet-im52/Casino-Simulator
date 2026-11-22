// Task 3: memoize a pure, synchronous function with selectable eviction policy.
// Argument matching uses Object.is: for objects, the SAME reference is a cache hit.
function memoize(fn, options = {}) {
    if (typeof fn !== "function") throw new TypeError("fn must be a function");

    const maxSize = options.maxSize === undefined ? Infinity : options.maxSize;
    const policy = options.policy || "lru"; // lru, lfu, ttl, custom
    const ttlMs = options.ttlMs === undefined ? null : options.ttlMs;
    const customEvict = options.customEvict;

    if (maxSize !== Infinity && (!Number.isInteger(maxSize) || maxSize < 0)) {
        throw new RangeError("maxSize must be a non-negative integer or Infinity");
    }
    if (!["lru", "lfu", "ttl", "custom"].includes(policy)) {
        throw new Error("Unknown cache policy");
    }
    if (ttlMs !== null && (!Number.isFinite(ttlMs) || ttlMs <= 0)) {
        throw new RangeError("ttlMs must be positive");
    }
    if (policy === "ttl" && ttlMs === null) {
        throw new Error("ttl policy requires ttlMs");
    }
    if (policy === "custom" && typeof customEvict !== "function") {
        throw new TypeError("custom policy requires customEvict(entries)");
    }

    const entries = [];
    let clock = 0;
    let nextId = 1;

    function pruneExpired() {
        if (ttlMs === null) return;
        const now = Date.now();
        for (let i = entries.length - 1; i >= 0; i--) {
            if (now - entries[i].createdAt >= ttlMs) entries.splice(i, 1);
        }
    }

    function selectEvictionIndex() {
        if (policy === "custom") {
            const snapshot = entries.map((e) => ({
                id: e.id, args: [...e.args], hits: e.hits,
                createdAt: e.createdAt, lastUsed: e.lastUsed
            }));
            const id = customEvict(snapshot);
            const index = entries.findIndex((e) => e.id === id);
            if (index < 0) throw new Error("customEvict must return an existing entry id");
            return index;
        }

        let selected = 0;
        for (let i = 1; i < entries.length; i++) {
            const a = entries[i];
            const b = entries[selected];
            if (policy === "lfu") {
                if (a.hits < b.hits || (a.hits === b.hits && a.lastUsed < b.lastUsed)) {
                    selected = i;
                }
            } else if (policy === "ttl") {
                // Expired entries were already pruned; when full, evict oldest created.
                if (a.createdAt < b.createdAt) selected = i;
            } else if (a.lastUsed < b.lastUsed) {
                selected = i; // LRU: least recently used
            }
        }
        return selected;
    }

    function memoized(...args) {
        pruneExpired();
        const existing = entries.find((e) =>
            e.args.length === args.length && e.args.every((v, i) => Object.is(v, args[i]))
        );
        if (existing) {
            existing.hits++;
            existing.lastUsed = ++clock;
            return existing.value;
        }

        const value = fn(...args); // compute only on cache miss; thrown errors are not cached
        if (maxSize === 0) return value;
        if (entries.length >= maxSize) entries.splice(selectEvictionIndex(), 1);
        entries.push({ id: nextId++, args: [...args], value, createdAt: Date.now(), lastUsed: ++clock, hits: 1 });
        return value;
    }

    memoized.clear = () => { entries.length = 0; };
    memoized.cacheSize = () => { pruneExpired(); return entries.length; };
    memoized.cacheInfo = () => { pruneExpired(); return entries.map((e) => ({ id: e.id, hits: e.hits, args: [...e.args] })); };
    return memoized;
}

module.exports = { memoize };
