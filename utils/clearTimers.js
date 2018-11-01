const timers = require("../database/timers");

module.exports = instance => {
  const timersToClear = timers.by("instance", instance);
  if (timersToClear) {
    for (const key of Object.keys(timersToClear)) {
      if (key !== "meta" && typeof timersToClear[key] === "object") {
        clearTimeout(timersToClear[key]);
      }
    }

    timers.remove(timersToClear);
  }
};
