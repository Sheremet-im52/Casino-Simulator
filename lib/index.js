// Task 2: the library's public entry point.
module.exports = {
    ...require("./generators"),
    ...require("./consume")
};
