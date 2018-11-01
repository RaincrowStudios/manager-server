const timers = require("../../database/timers");
const getFieldsFromHash = require("../../redis/getFieldsFromHash");
const updateHashField = require("../../redis/updateHashField");
const handleError = require("../../utils/handleError");
const informGame = require("../../utils/informGame");

async function botAction(botInstance) {
  try {
    const { state, actionFreq } = await getFieldsFromHash(botInstance, [
      "state",
      "actionFreq"
    ]);

    if (actionFreq) {
      if (state !== "dead") {
        informGame(botInstance, "covens", "head", "covens/npe/action");
      }

      const currentTime = Date.now();

      let newActionOn, seconds;
      if (actionFreq.includes("-")) {
        const [min, max] = actionFreq.split("-");

        seconds =
          Math.floor(
            Math.random() * (parseInt(max, 10) - parseInt(min, 10) + 1)
          ) + parseInt(min, 10);
      } else {
        seconds = parseInt(actionFreq, 10);
      }

      newActionOn = currentTime + seconds * 1000;

      await updateHashField(botInstance, "actionOn", newActionOn);

      const newTimer = setTimeout(
        () => () => botAction(botInstance),
        newActionOn - currentTime
      );

      const botTimers = timers.by("instance", botInstance);
      if (botTimers) {
        botTimers.actionTimer = newTimer;
        timers.update(botTimers);
      }
    }

    return true;
  } catch (err) {
    return handleError(err);
  }
}

module.exports = botAction;
