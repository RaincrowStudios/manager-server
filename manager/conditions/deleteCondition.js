const timers = require('../../database/timers')
const removeFromActiveSet = require('../../redis/removeFromActiveSet')
const removeFromList = require('../../redis/removeFromList')

module.exports = (conditionInstance) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (conditionInstance) {
        await Promise.all([
          removeFromActiveSet('conditions', conditionInstance),
          removeFromList('conditions', conditionInstance)
        ])

        const conditionTimers = timers.by('instance', conditionInstance)
        if (conditionTimers) {
          clearTimeout(conditionTimers.expireTimer)
          clearTimeout(conditionTimers.triggerTimer)
          timers.remove(conditionTimers)
        }
      }
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
