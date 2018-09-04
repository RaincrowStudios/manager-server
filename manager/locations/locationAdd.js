const timers = require('../../database/timers')
const locationReward = require('./locationReward')

module.exports = (locationInstance, location) => {
  try {
    const currentTime = Date.now()

    const rewardTimer =
      setTimeout(() =>
        locationReward(locationInstance), location.rewardOn - currentTime
      )

    timers.insert({locationInstance, rewardTimer})

    return true
  }
  catch (err) {
    console.error(err)
  }
}
