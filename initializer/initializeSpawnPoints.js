const timers = require("../database/timers");
const addFieldToHash = require("../redis/addFieldToHash");
const checkKeyExistance = require("../redis/checkKeyExistance");
const getActiveSet = require("../redis/getActiveSet");
const getFieldsFromHash = require("../redis/getFieldsFromHash");
const removeFromAll = require("../redis/removeFromAll");
const spawnPointExpire = require("../manager/spawnPoints/spawnPointExpire");

module.exports = async (id, managers) => {
  const spawnPoints = await getActiveSet("spawnPoints");

  if (spawnPoints.length) {
    for (let i = 0, length = spawnPoints.length; i < length; i++) {
      if (!spawnPoints[i] || !(await checkKeyExistance(spawnPoints[i]))) {
        removeFromAll("spawnPoints", spawnPoints[i]);
        continue;
      }

      const { manager, expiresOn } = await getFieldsFromHash(spawnPoints[i], [
        "manager",
        "expiresOn"
      ]);

      if (manager === id || !managers.includes(manager)) {
        await addFieldToHash(spawnPoints[i], "manager", id);

        const currentTime = Date.now();

        if (expiresOn < currentTime) {
          spawnPointExpire(spawnPoints[i]);
          continue;
        }

        const expireTimer = setTimeout(
          () => () => spawnPointExpire(spawnPoints[i]),
          expiresOn - currentTime
        );

        const previousTimers = timers.by("instance", spawnPoints[i]);
        if (previousTimers) {
          previousTimers.expireTimer = expireTimer;
          timers.update(previousTimers);
        } else {
          timers.insert({ instance: spawnPoints[i], expireTimer });
        }
      }
    }
  }

  return true;
};
