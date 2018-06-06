const timers = require('../../database/timers')
const consumableExpire = require('./consumableExpire')

module.exports = (consumableInstance, consumable) => {
  try {
    const currentTime = Date.now()
    const timer = {instance: consumableInstance}

    const expireTimer =
      setTimeout(() =>
        consumableExpire(consumableInstance),
        consumable.expiresOn - currentTime
      )

    timer.expireTimer = expireTimer

    timers.insert(timer)
    return true
  }
  catch (err) {
    console.error(err)
  }
}
