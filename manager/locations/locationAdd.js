const timers = require("../../database/timers");
const getOneFromHash = require("../../redis/getOneFromHash");
const handleError = require("../../utils/handleError");
const locationReward = require("./locationReward");

module.exports = async locationInstance => {
  try {
    const timer = { instance: locationInstance };

    const rewardOn = await getOneFromHash(locationInstance, "rewardOn");

    const currentTime = Date.now();

    const rewardTimer = setTimeout(
      () => () => locationReward(locationInstance),
      rewardOn - currentTime
    );

    timer.rewardTimer = rewardTimer;

    timers.insert(timer);

    return true;
  } catch (err) {
    return handleError(err);
  }
};
