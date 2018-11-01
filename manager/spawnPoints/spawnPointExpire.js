const removeFromAll = require("../../redis/removeFromAll");
const clearTimers = require("../../utils/clearTimers");
const handleError = require("../../utils/handleError");

module.exports = spawnPointInstance => {
  try {
    clearTimers(spawnPointInstance);

    return removeFromAll("spawnPoints", spawnPointInstance);
  } catch (err) {
    return handleError(err);
  }
};
