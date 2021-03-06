const timers = require("../database/timers");
const addFieldToHash = require("../redis/addFieldToHash");
const checkKeyExistance = require("../redis/checkKeyExistance");
const getActiveSet = require("../redis/getActiveSet");
const getFieldsFromHash = require("../redis/getFieldsFromHash");
const removeFromAll = require("../redis/removeFromAll");
const portalSummon = require("../manager/portals/portalSummon");

module.exports = async (id, managers) => {
  const portals = await getActiveSet("portals");

  if (portals.length) {
    for (let i = 0, length = portals.length; i < length; i++) {
      if (!portals[i] || !(await checkKeyExistance(portals[i]))) {
        removeFromAll("portals", portals[i]);
        continue;
      }

      const { manager, energy, summonOn } = await getFieldsFromHash(
        portals[i],
        ["manager", "energy", "summonOn"]
      );

      if (manager === id || !managers.includes(manager)) {
        await addFieldToHash(portals[i], "manager", id);

        if (energy > 0) {
          removeFromAll("portals", portals[i]);
        }

        const currentTime = Date.now();

        const summonTimer = setTimeout(
          () => portalSummon(portals[i]),
          summonOn > currentTime ? summonOn - currentTime : 0
        );

        const previousTimers = timers.by("instance", portals[i]);
        if (previousTimers) {
          previousTimers.summonTimer = summonTimer;
          timers.update(previousTimers);
        } else {
          timers.insert({ instance: portals[i], summonTimer });
        }
      }
    }
  }

  return true;
};
