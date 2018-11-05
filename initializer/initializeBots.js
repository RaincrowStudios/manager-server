const timers = require("../database/timers");
const addFieldToHash = require("../redis/addFieldToHash");
const checkKeyExistance = require("../redis/checkKeyExistance");
const getActiveSet = require("../redis/getActiveSet");
const getFieldsFromHash = require("../redis/getFieldsFromHash");
const removeFromAll = require("../redis/removeFromAll");
const botAction = require("../manager/bots/botAction");
const botMove = require("../manager/bots/botMove");

module.exports = async (id, managers) => {
  const bots = await getActiveSet("bots");

  if (bots.length) {
    for (let i = 0, length = bots.length; i < length; i++) {
      if (!bots[i] || !(await checkKeyExistance(bots[i]))) {
        removeFromAll("bots", bots[i]);
        removeFromAll("characters", bots[i]);
        continue;
      }

      const { manager, state, actionOn, moveOn } = await getFieldsFromHash(
        bots[i],
        ["manager", "state", "actionOn", "moveOn"]
      );

      if (manager === id || !managers.includes(manager)) {
        await addFieldToHash(bots[i], "manager", id);

        if (state === "dead") {
          continue;
        } else {
          const currentTime = Date.now();

          const actionTimer = setTimeout(
            () => botAction(bots[i]),
            actionOn > currentTime ? actionOn - currentTime : 0
          );

          let moveTimer;
          if (moveOn) {
            moveTimer = setTimeout(
              () => botMove(bots[i]),
              moveOn > currentTime ? moveOn - currentTime : 0
            );
          }

          const previousTimers = timers.by("instance", bots[i]);
          if (previousTimers) {
            previousTimers.actionTimer = actionTimer;
            previousTimers.moveTimer = moveTimer;
            timers.update(previousTimers);
          } else {
            timers.insert({
              instance: bots[i],
              actionTimer,
              moveTimer
            });
          }
        }
      }
    }
  }

  return true;
};
