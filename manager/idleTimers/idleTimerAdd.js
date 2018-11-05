const timers = require("../../database/timers");
const getFieldsFromHash = require("../../redis/getFieldsFromHash");
const handleError = require("../../utils/handleError");
const idleTimerBoot = require("./idleTimerBoot");
const idleTimerDisengage = require("./idleTimerDisengage");

module.exports = async idleTimerInstance => {
  try {
    const timer = { instance: idleTimerInstance };

    const { bootOn, disengageOn } = await getFieldsFromHash(idleTimerInstance, [
      "bootOn",
      "disengageOn"
    ]);

    const currentTime = Date.now();

    if (bootOn) {
      const bootTimer = setTimeout(
        () => idleTimerBoot(idleTimerInstance),
        bootOn - currentTime
      );

      timer.bootTimer = bootTimer;
    }

    if (disengageOn) {
      const disengageTimer = setTimeout(
        () => idleTimerDisengage(idleTimerInstance),
        disengageOn - currentTime
      );

      timer.disengageTimer = disengageTimer;
    }

    timers.insert(timer);
    return true;
  } catch (err) {
    return handleError(err);
  }
};
