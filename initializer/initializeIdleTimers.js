const timers = require("../database/timers");
const addFieldToHash = require("../redis/addFieldToHash");
const checkKeyExistance = require("../redis/checkKeyExistance");
const getActiveSet = require("../redis/getActiveSet");
const getFieldsFromHash = require("../redis/getFieldsFromHash");
const removeFromAll = require("../redis/removeFromAll");
const idleTimerBoot = require("../manager/idleTimers/idleTimerBoot");
const idleTimerDisengage = require("../manager/idleTimers/idleTimerDisengage");

module.exports = async (id, managers) => {
  const idleTimers = await getActiveSet("idleTimers");

  if (idleTimers.length) {
    for (let i = 0; i < idleTimers.length; i++) {
      if (!idleTimers[i] || !(await checkKeyExistance(idleTimers[i]))) {
        removeFromAll("idleTimers", idleTimers[i]);
        continue;
      }

      const { manager, bootOn, disengageOn } = await getFieldsFromHash(
        idleTimers[i],
        ["manager", "bootOn", "disengageOn"]
      );

      if (manager === id || !managers.includes(manager)) {
        await addFieldToHash(idleTimers[i], "manager", id);

        const currentTime = Date.now();

        const timer = { instance: idleTimers[i] };

        if (bootOn) {
          const bootTimer = setTimeout(
            () => () => idleTimerBoot(idleTimers[i]),
            bootOn - currentTime
          );

          timer.bootTimer = bootTimer;
        }

        if (disengageOn) {
          const disengageTimer = setTimeout(
            () => () => idleTimerDisengage(idleTimers[i]),
            disengageOn - currentTime
          );

          timer.disengageTimer = disengageTimer;
        }

        const previousTimers = timers.by("instance", idleTimers[i]);
        if (previousTimers) {
          previousTimers.bootTimer = timer.bootTimer;
          previousTimers.disengageOn = timer.disengageTimer;
          timers.update(previousTimers);
        } else {
          timers.insert(timer);
        }
      }
    }
  }

  return true;
};
