const timers = require('../../database/timers')
const locationExpire = require('./locationExpire')

module.exports = (locationInstance, location) => {
  try {
    const currentTime = Date.now()

    const expireTimer =
      setTimeout(() =>
        locationExpire(locationInstance), location.expiresOn - currentTime
      )

    timers.insert({locationInstance, expireTimer})
  }
  catch (err) {
    console.error(err)
  }
}
