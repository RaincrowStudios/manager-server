const timers = require('../../database/timers')
const removeFromActiveSet = require('../../redis/removeFromActiveSet')
const removeHash = require('../../redis/removeHash')

module.exports = async (instance) => {
  try {
    await Promise.all([
      removeFromActiveSet('conditions', instance),
      removeHash(instance)
    ])

    const conditionTimers = timers.by('instance', instance)
    if (conditionTimers) {
      clearTimeout(conditionTimers.expireTimer)
      clearTimeout(conditionTimers.triggerTimer)
      timers.remove(conditionTimers)
    }
  }
  catch (err) {
    console.error(err)
  }
}
