const timers = require('../../database/timers')
const immunityExpire = require('./immunityExpire')

module.exports = (immunityInstance, immunity) => {
  try {
    const currentTime = Date.now()
    const timer = {instance: immunityInstance}

    const expireTimer =
      setTimeout(() =>
        immunityExpire(immunityInstance),
        immunity.expiresOn - currentTime
      )

    timer.expireTimer = expireTimer

    timers.insert(timer)
    return true
  }
  catch (err) {
    console.error(err)
  }
}
