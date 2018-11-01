const timers = require("../../database/timers");
const getOneFromHash = require("../../redis/getOneFromHash");
const handleError = require("../../utils/handleError");
const portalSummon = require("./portalSummon");

module.exports = async portalInstance => {
  try {
    const summonOn = await getOneFromHash(portalInstance, "summonOn");

    const currentTime = Date.now();

    const summonTimer = setTimeout(
      () => () => portalSummon(portalInstance),
      summonOn - currentTime
    );

    timers.insert({ portalInstance, summonTimer });
    return true;
  } catch (err) {
    handleError(err);
  }
};
