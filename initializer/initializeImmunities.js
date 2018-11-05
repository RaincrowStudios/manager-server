const timers = require("../database/timers");
const addFieldToHash = require("../redis/addFieldToHash");
const checkKeyExistance = require("../redis/checkKeyExistance");
const getActiveSet = require("../redis/getActiveSet");
const getFieldsFromHash = require("../redis/getFieldsFromHash");
const removeFromAll = require("../redis/removeFromAll");
const immunityExpire = require("../manager/immunities/immunityExpire");

module.exports = async (id, managers) => {
  const immunities = await getActiveSet("immunities");

  if (immunities.length) {
    for (let i = 0, length = immunities.length; i < length; i++) {
      if (!immunities[i] || !(await checkKeyExistance(immunities[i]))) {
        removeFromAll("immunities", immunities[i]);
        continue;
      }

      const { manager, expiresOn } = await getFieldsFromHash(immunities[i], [
        "manager",
        "expiresOn"
      ]);

      if (manager === id || !managers.includes(manager)) {
        await addFieldToHash(immunities[i], "manager", id);

        const currentTime = Date.now();

        if (expiresOn < currentTime) {
          immunityExpire(immunities[i]);
          continue;
        }

        const expireTimer = setTimeout(
          () => immunityExpire(immunities[i]),
          expiresOn - currentTime
        );

        const previousTimers = timers.by("instance", immunities[i]);
        if (previousTimers) {
          previousTimers.expireTimer = expireTimer;
          timers.update(previousTimers);
        } else {
          timers.insert({ instance: immunities[i], expireTimer });
        }
      }
    }
  }

  return true;
};
