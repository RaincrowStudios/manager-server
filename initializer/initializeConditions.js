const timers = require("../database/timers");
const addFieldToHash = require("../redis/addFieldToHash");
const checkKeyExistance = require("../redis/checkKeyExistance");
const getActiveSet = require("../redis/getActiveSet");
const getFieldsFromHash = require("../redis/getFieldsFromHash");
const removeFromAll = require("../redis/removeFromAll");
const conditionExpire = require("../manager/conditions/conditionExpire");
const conditionTrigger = require("../manager/conditions/conditionTrigger");

module.exports = async (id, managers) => {
  const conditions = await getActiveSet("conditions");

  if (conditions.length) {
    for (let i = 0, length = conditions.length; i < length; i++) {
      if (!conditions[i] || !(await checkKeyExistance(conditions[i]))) {
        removeFromAll("conditions", conditions[i]);
        continue;
      }

      const { manager, triggerOn, expiresOn } = await getFieldsFromHash(
        conditions[i],
        ["manager", "triggerOn", "expiresOn"]
      );

      if (manager === id || !managers.includes(manager)) {
        await addFieldToHash(conditions[i], "manager", id);

        const currentTime = Date.now();

        if (expiresOn !== 0 && expiresOn < currentTime) {
          conditionExpire(conditions[i]);
          continue;
        }

        let triggerTimer;
        if (triggerOn) {
          triggerTimer = setTimeout(
            () => conditionTrigger(conditions[i]),
            triggerOn > currentTime ? triggerOn - currentTime : 0
          );
        }

        let expireTimer;
        if (expiresOn) {
          expireTimer = setTimeout(
            () => conditionExpire(conditions[i]),
            expiresOn - currentTime
          );
        }

        const previousTimers = timers.by("instance", conditions[i]);
        if (previousTimers) {
          previousTimers.triggerTimer = triggerTimer;
          previousTimers.expireTimer = expireTimer;
          timers.update(previousTimers);
        } else {
          timers.insert({
            instance: conditions[i],
            triggerTimer,
            expireTimer
          });
        }
      }
    }
  }
  return true;
};
