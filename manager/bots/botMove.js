const timers = require("../../database/timers");
const getFieldsFromHash = require("../../redis/getFieldsFromHash");
const updateHashField = require("../../redis/updateHashField");
const handleError = require("../../utils/handleError");
const informGame = require("../../utils/informGame");

async function botMove(botInstance) {
  try {
    const { state, moveFreq } = await getFieldsFromHash(botInstance, [
      "state",
      "moveFreq"
    ]);

    if (moveFreq) {
      if (state !== "dead") {
        informGame(botInstance, "covens", "head", "covens/npe/move");
      }

      const currentTime = Date.now();

      let newMoveOn, seconds;
      if (moveFreq.includes("-")) {
        const [min, max] = moveFreq.split("-");

        seconds =
          Math.floor(
            Math.random() * (parseInt(max, 10) - parseInt(min, 10) + 1)
          ) + parseInt(min, 10);
      } else {
        seconds = parseInt(moveFreq, 10);
      }

      newMoveOn = currentTime + seconds * 1000;

      await updateHashField(botInstance, "moveOn", newMoveOn);

      const newTimer = setTimeout(
        () => () => botMove(botInstance),
        newMoveOn - currentTime
      );

      const botTimers = timers.by("instance", botInstance);
      if (botTimers) {
        botTimers.moveTimer = newTimer;
        timers.update(botTimers);
      }
    }

    return true;
  } catch (err) {
    return handleError(err);
  }
}

module.exports = botMove;
