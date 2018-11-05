const timers = require("../../database/timers");
const getOneFromHash = require("../../redis/getOneFromHash");
const handleError = require("../../utils/handleError");
const collectibleExpire = require("./collectibleExpire");

module.exports = async collectibleInstance => {
  try {
    const timer = { instance: collectibleInstance };

    const expiresOn = await getOneFromHash(collectibleInstance, "expiresOn");

    const currentTime = Date.now();

    if (expiresOn) {
      const expireTimer = setTimeout(
        () => collectibleExpire(collectibleInstance),
        expiresOn - currentTime
      );

      timer.expireTimer = expireTimer;

      timers.insert(timer);
    }

    return true;
  } catch (err) {
    return handleError(err);
  }
};
