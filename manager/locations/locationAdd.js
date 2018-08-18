const timers = require('../../database/timers')
const locationExpire = require('./locationExpire')

module.exports = (locationInstance, location) => {
  try {
    const currentTime = Date.now()

    const expireTimer =
      setTimeout(() =>
        locationExpire(locationInstance), location.rewardOn - currentTime
      )

    timers.insert({locationInstance, expireTimer})

    return true
  }
  catch (err) {
    console.error(err)
  }
}
