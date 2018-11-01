const timers = require("../database/timers");
const addEntriesToList = require("../redis/addEntriesToList");
const getEntriesFromList = require("../redis/getEntriesFromList");
const dailiesReset = require("../manager/dailies/dailiesReset");

module.exports = async (id, managers) => {
  const [manager, expiresOn] = await getEntriesFromList("dailies", [
    "manager",
    "expiresOn"
  ]);

  if (manager === id || !managers.includes(manager)) {
    await addEntriesToList("dailies", ["manager"], [id]);

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
  }

  return true;
};
