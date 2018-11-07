const timers = require('../database/timers')
const addFieldToHash = require('../redis/addFieldToHash')
const checkKeyExistance = require('../redis/checkKeyExistance')
const getActiveSet = require('../redis/getActiveSet')
const getFieldsFromHash = require('../redis/getFieldsFromHash')
const removeFromAll = require('../redis/removeFromAll')
const spiritAction = require('../manager/spirits/spiritAction')
const spiritExpire = require('../manager/spirits/spiritExpire')
const spiritKill = require('../manager/spirits/spiritKill')
const spiritMove = require('../manager/spirits/spiritMove')

module.exports = async (id, managers) => {
  const spirits = await getActiveSet('spirits')

  if (spirits.length) {
    for (let i = 0, length = spirits.length; i < length; i++) {
      if (!spirits[i] || !(await checkKeyExistance(spirits[i]))) {
        removeFromAll('spirits', spirits[i])
        continue
      }

      const {
        manager,
        state,
        lastAttackedBy,
        actionOn,
        moveOn,
        expiresOn
      } = await getFieldsFromHash(spirits[i], [
        'manager',
        'state',
        'lastAttackedBy',
        'actionOn',
        'moveOn',
        'expiresOn'
      ])

      if (manager === id || !managers.includes(manager)) {
        await addFieldToHash(spirits[i], 'manager', id)

        const currentTime = Date.now()

        if (expiresOn !== 0 && expiresOn < currentTime) {
          spiritExpire(spirits[i])
          continue
        }

        if (state === 'dead') {
          if (lastAttackedBy.instance) {
            spiritKill(spirits[i])
            continue
          } else {
            spiritExpire(spirits[i])
            continue
          }
        }

        const actionTimer = setTimeout(
          () => spiritAction(spirits[i]),
          actionOn > currentTime ? actionOn - currentTime : 0
        )

        let moveTimer
        if (moveOn) {
          moveTimer = setTimeout(
            () => spiritMove(spirits[i]),
            moveOn > currentTime ? moveOn - currentTime : 0
          )
        }

        let expireTimer
        if (expiresOn) {
          expireTimer = setTimeout(
            () => spiritExpire(spirits[i]),
            expiresOn - currentTime
          )
        }

        const previousTimers = timers.by('instance', spirits[i])
        if (previousTimers) {
          previousTimers.actionTimer = actionTimer
          previousTimers.moveTimer = moveTimer
          previousTimers.expireTimer = expireTimer
          timers.update(previousTimers)
        } else {
          timers.insert({
            instance: spirits[i],
            actionTimer,
            moveTimer,
            expireTimer
          })
        }
      }
    }
  }

  return true
}
