const clearTimers = require("../../utils/clearTimers");
const handleError = require("../../utils/handleError");
const informGame = require("../../utils/informGame");

module.exports = spiritInstance => {
  try {
    clearTimers(spiritInstance);

    return informGame(
      spiritInstance,
      "covens",
      "head",
      "covens/spirit/kill",
      1
    );
  } catch (err) {
    return handleError(err);
  }
};
