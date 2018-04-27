const timers = require('../../database/timers')
const cooldownExpire = require('./cooldownExpire')

module.exports = (cooldownInstance, cooldown) => {
  try {
    const currentTime = Date.now()
    const timer = {instance: cooldownInstance}

    const expireTimer =
      setTimeout(() =>
        cooldownExpire(cooldownInstance),
        cooldown.expiresOn - currentTime
      )

    timer.expireTimer = expireTimer

    timers.insert(timer)
    return true
  }
  catch (err) {
    console.error(err)
  }
}
