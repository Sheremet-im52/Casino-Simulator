// Task 1: function* creates a generator. yield supplies one value per next().
function* counterGenerator(start = 1, step = 1) {
    let number = start;
    while (true) {
        yield number;
        number = number + step;
    }
}

function* weekdayGenerator() {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    let index = 0;
    while (true) {
        yield days[index];
        index = (index + 1) % days.length;
    }
}

module.exports = { counterGenerator, weekdayGenerator };
