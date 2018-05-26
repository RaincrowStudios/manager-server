const timers = require('../../database/timers')
const locationExpire = require('./locationExpire')

module.exports = (instance, location) => {
  try {
    const currentTime = Date.now()

    const expireTimer =
      setTimeout(() =>
        locationExpire(instance), location.expiresOn - currentTime
      )

    timers.insert({instance, expireTimer})
  }
  catch (err) {
    console.error(err)
  }
}
