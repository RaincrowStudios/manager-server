const timers = require('../../database/timers')
const conditionExpire = require('./conditionExpire')
const conditionTrigger = require('./conditionTrigger')

module.exports = (instance, condition) => {
  try {
    const currentTime = Date.now()
    let timer = {instance}

    const expireTimer =
      setTimeout(() =>
        conditionExpire(instance),
        condition.expiresOn - currentTime
      )

    timer.expireTimer = expireTimer

    if (condition.triggerOn) {
      const triggerTimer =
        setTimeout(() =>
          conditionTrigger(instance),
          condition.triggerOn - currentTime
        )

      timer.triggerTimer = triggerTimer

    }

    timers.insert(timer)
  }
  catch (err) {
    console.error(err)
  }
}
