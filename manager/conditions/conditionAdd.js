const timers = require('../../database/timers')
const conditionExpire = require('./conditionExpire')
const conditionTrigger = require('./conditionTrigger')

module.exports = (conditionInstance, condition) => {
  try {
    const currentTime = Date.now()
    const timer = {instance: conditionInstance}

    if (condition.expiresOn) {
      const expireTimer =
        setTimeout(() =>
          conditionExpire(conditionInstance),
          condition.expiresOn - currentTime
        )

      timer.expireTimer = expireTimer
    }

    if (condition.triggerOn) {
      const triggerTimer =
        setTimeout(() =>
          conditionTrigger(conditionInstance),
          condition.triggerOn - currentTime
        )

      timer.triggerTimer = triggerTimer
    }

    timers.insert(timer)
    return true
  }
  catch (err) {
    console.error(err)
  }
}
