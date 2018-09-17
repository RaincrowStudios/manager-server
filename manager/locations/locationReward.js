const timers = require('../../database/timers')
const updateHashField = require('../../redis/updateHashField')
const handleError = require('../../utils/handleError')
const informGame = require('../../utils/informGame')

module.exports = async (locationInstance) => {
  try {
    const currentTime = Date.now()

    const newRewardOn = currentTime + (86400000 * 9)

    const locationTimers = timers.by('instance', locationInstance)
    if (locationTimers) {
      locationTimers.rewardTimer = newRewardOn
      timers.update(locationTimers)
    }

    await updateHashField(locationInstance, 'rewardOn', newRewardOn)

    return informGame(
      locationInstance,
      'covens',
      'head',
      'covens/location/reward'
    )
  }
  catch (err) {
    return handleError(err)
  }
}
