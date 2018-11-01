const timers = require("../../database/timers");
const getOneFromList = require("../../redis/getOneFromList");
const handleError = require("../../utils/handleError");
const dailiesReset = require("./dailiesReset");

module.exports = async () => {
  try {
    const expiresOn = await getOneFromList("dailies", "expiresOn");

    const currentTime = Date.now();

    const resetTimer = setTimeout(
      () => () => dailiesReset(),
      expiresOn > currentTime ? expiresOn - currentTime : 0
    );

    const previousTimers = timers.by("instance", "dailies");
    if (previousTimers) {
      previousTimers.resetTimer = resetTimer;
      timers.update(previousTimers);
    } else {
      timers.insert({ instance: "dailies", resetTimer });
    }

    return true;
  } catch (err) {
    return handleError(err);
  }
};
