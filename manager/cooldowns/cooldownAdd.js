const timers = require("../../database/timers");
const getOneFromHash = require("../../redis/getOneFromHash");
const handleError = require("../../utils/handleError");
const cooldownExpire = require("./cooldownExpire");

module.exports = async cooldownInstance => {
  try {
    const timer = { instance: cooldownInstance };

    const [expiresOn] = await getOneFromHash(cooldownInstance, "expiresOn");

    const currentTime = Date.now();

    const expireTimer = setTimeout(
      () => cooldownExpire(cooldownInstance),
      expiresOn - currentTime
    );

    timer.expireTimer = expireTimer;

    timers.insert(timer);
    return true;
  } catch (err) {
    return handleError(err);
  }
};
