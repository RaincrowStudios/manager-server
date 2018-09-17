const timers = require('../../database/timers')
const getOneFromHash = require('../../redis/getOneFromHash')
const handleError = require('../../utils/handleError')
const locationReward = require('./locationReward')

module.exports = async (locationInstance) => {
  try {
    const rewardOn = await getOneFromHash(locationInstance, 'rewardOn')

    const currentTime = Date.now()

    const rewardTimer =
      setTimeout(() =>
        locationReward(locationInstance), rewardOn - currentTime
      )

    timers.insert({locationInstance, rewardTimer})

    return true
  }
  catch (err) {
    return handleError(err)
  }
}
