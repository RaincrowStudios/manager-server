const timers = require('../database/timers')
const addFieldToHash = require('../redis/addFieldToHash')
const checkKeyExistance = require('../redis/checkKeyExistance')
const getActiveSet = require('../redis/getActiveSet')
const getFieldsFromHash = require('../redis/getFieldsFromHash')
const removeFromAll = require('../redis/removeFromAll')
const dukeAction = require('../manager/dukes/dukeAction')
const dukeExpire = require('../manager/dukes/dukeExpire')
const dukeMove = require('../manager/dukes/dukeMove')
const dukeSummon = require('../manager/dukes/dukeSummon')

module.exports = async (id, managers) => {
  const dukes = await getActiveSet('dukes')

  if (dukes.length) {
    for (let i = 0; i < dukes.length; i++) {
      if (!dukes[i] || !await checkKeyExistance(dukes[i])) {
        removeFromAll('dukes', dukes[i])
        continue
      }

      const {manager, actionOn, moveOn, summonOn, expiresOn} =
        await getFieldsFromHash(
          dukes[i],
          [
            'manager',
            'actionOn',
            'moveOn',
            'summonOn',
            'expiresOn'
          ]
        )

      if (!managers.includes(manager)) {
        await addFieldToHash(dukes[i], 'manager', id)

        const currentTime = Date.now()

        if (expiresOn !== 0 && expiresOn < currentTime) {
          dukeExpire(dukes[i])
          continue
        }

        const actionTimer =
          setTimeout(() =>
             dukeAction(dukes[i]),
             actionOn > currentTime ?
               actionOn - currentTime : 0
           )

        let moveTimer
        if (moveOn) {
          moveTimer =
            setTimeout(() =>
              dukeMove(dukes[i]),
              moveOn > currentTime ?
                moveOn - currentTime : 0
            )
        }

        let summonTimer
        if (summonOn) {
          summonTimer =
            setTimeout(() =>
              dukeSummon(dukes[i]),
              summonOn > currentTime ?
                summonOn - currentTime : 0
            )
        }

        let expireTimer
        if (expiresOn) {
          expireTimer =
            setTimeout(() =>
              dukeExpire(dukes[i]),
              expiresOn - currentTime
            )
        }

        const previousTimers = timers.by('instance', dukes[i])
        if (previousTimers) {
          previousTimers.actionTimer = actionTimer
          previousTimers.moveTimer = moveTimer
          previousTimers.summonTimer = summonTimer
          previousTimers.expireTimer = expireTimer
          timers.update(previousTimers)
        }
        else {
          timers.insert({
            instance: dukes[i],
            actionTimer,
            moveTimer,
            summonTimer,
            expireTimer
          })
        }
      }
    }
  }

  return true
}
