const clearTimers = require("../../utils/clearTimers");
const handleError = require("../../utils/handleError");
const informGame = require("../../utils/informGame");

module.exports = idleTimerInstance => {
  try {
    clearTimers(idleTimerInstance);

    return informGame(
      idleTimerInstance,
      "covens",
      "head",
      "covens/spirit/disengage"
    );
  } catch (err) {
    return handleError(err);
  }
};
