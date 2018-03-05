const timers = require('../../database/timers')
const addToRedis = require('../../utils/addToRedis')
const addToSet = require('../../utils/addToSet')
const conditionExpire = require('./conditionExpire')
const conditionTrigger = require('./conditionTrigger')

module.exports = async (instance, bearerName, condition) => {
  try {
    const currentTime = Date.now()
    let timer = {instance}
    const expireTimer =
      setTimeout(() =>
        conditionExpire(instance, bearerName),
        condition.expiresOn - currentTime
      )

    timer.expireTimer = expireTimer

    if (condition.triggerOn) {
      const triggerTimer =
        setTimeout(() =>
          conditionTrigger(instance, bearerName), condition.triggerOn - currentTime
        )

      timer.triggerTimer = triggerTimer
    }

    await Promise.all([
      addToRedis(instance, ['bearer'], [bearerName]),
      addToSet('conditions', instance)
    ])
    timers.insert(timer)
  }
  catch (err) {
    console.error(err)
  }
}
