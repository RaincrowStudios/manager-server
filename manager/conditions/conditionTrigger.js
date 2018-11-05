const timers = require("../../database/timers");
const getFieldsFromHash = require("../../redis/getFieldsFromHash");
const updateHashField = require("../../redis/updateHashField");
const handleError = require("../../utils/handleError");
const informGame = require("../../utils/informGame");

async function conditionTrigger(conditionInstance) {
  try {
    const { triggerOn, tick } = await getFieldsFromHash(conditionInstance, [
      "triggerOn",
      "tick"
    ]);

    if (triggerOn) {
      informGame(
        conditionInstance,
        "covens",
        "head",
        "covens/condition/trigger"
      );
    }

    const currentTime = Date.now();

    const newTriggerOn = currentTime + tick * 1000;

    await updateHashField(conditionInstance, "triggerOn", newTriggerOn);

    const newTimer = setTimeout(
      () => conditionTrigger(conditionInstance),
      tick * 1000
    );

    const conditionTimer = timers.by("instance", conditionInstance);
    if (conditionTimer) {
      conditionTimer.triggerTimer = newTimer;
      timers.update(conditionTimer);
    }

    return true;
  } catch (err) {
    return handleError(err);
  }
}

module.exports = conditionTrigger;
