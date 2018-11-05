const timers = require("../database/timers");
const addFieldToHash = require("../redis/addFieldToHash");
const checkKeyExistance = require("../redis/checkKeyExistance");
const getActiveSet = require("../redis/getActiveSet");
const getFieldsFromHash = require("../redis/getFieldsFromHash");
const removeFromAll = require("../redis/removeFromAll");
const locationReward = require("../manager/locations/locationReward");

module.exports = async (id, managers) => {
  const locations = await getActiveSet("locations");

  if (locations.length) {
    for (let i = 0, length = locations.length; i < length; i++) {
      if (!locations[i] || !(await checkKeyExistance(locations[i]))) {
        removeFromAll("locations", locations[i]);
        continue;
      }

      const { manager, rewardOn } = await getFieldsFromHash(locations[i], [
        "manager",
        "rewardOn"
      ]);

      if (manager === id || !managers.includes(manager)) {
        await addFieldToHash(locations[i], "manager", id);

        const currentTime = Date.now();

        if (rewardOn < currentTime) {
          locationReward(locations[i]);
          continue;
        }

        const rewardTimer = setTimeout(
          () => () => locationReward(locations[i]),
          rewardOn - currentTime
        );

        const previousTimers = timers.by("instance", locations[i]);
        if (previousTimers) {
          previousTimers.rewardTimer = rewardTimer;
          timers.update(previousTimers);
        } else {
          timers.insert({ instance: locations[i], rewardTimer });
        }
      }
    }
  }

  return true;
};
