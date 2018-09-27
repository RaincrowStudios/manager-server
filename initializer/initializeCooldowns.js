const timers = require('../database/timers')
const addFieldToHash = require('../redis/addFieldToHash')
const checkKeyExistance = require('../redis/checkKeyExistance')
const getActiveSet = require('../redis/getActiveSet')
const getFieldsFromHash = require('../redis/getFieldsFromHash')
const removeFromAll = require('../redis/removeFromAll')
const cooldownExpire = require('../manager/cooldowns/cooldownExpire')

module.exports = async (id, managers) => {
  const cooldowns = await getActiveSet('cooldowns')

  if (cooldowns.length) {
    for (let i = 0; i < cooldowns.length; i++) {
      if (!cooldowns[i] || !await checkKeyExistance(cooldowns[i])) {
        removeFromAll('cooldowns', cooldowns[i])
        continue
      }

      const {manager, expiresOn} = await getFieldsFromHash(
        cooldowns[i],
        ['manager', 'expiresOn']
      )

      if (!managers.includes(manager)) {
        await addFieldToHash(cooldowns[i], 'manager', id)

        const currentTime = Date.now()

        if (expiresOn < currentTime) {
          cooldownExpire(cooldowns[i])
          continue
        }

        const expireTimer =
          setTimeout(() =>
            cooldownExpire(cooldowns[i]),
            expiresOn - currentTime
          )

        const previousTimers = timers.by('instance', cooldowns[i])
        if (previousTimers) {
          previousTimers.expireTimer

          timers.update(previousTimers)
        }
        else {
          timers.insert({instance: cooldowns[i], expireTimer})
        }
      }
    }
  }

  return true
}
