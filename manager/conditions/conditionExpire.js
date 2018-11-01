const clearTimers = require("../../utils/clearTimers");
const handleError = require("../../utils/handleError");
const informGame = require("../../utils/informGame");

module.exports = conditionInstance => {
  try {
    clearTimers(conditionInstance);

    return informGame(
      conditionInstance,
      "covens",
      "head",
      "covens/condition/expire",
      1
    );
  } catch (err) {
    return handleError(err);
  }
};
