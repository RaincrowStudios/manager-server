const timers = require('../../database/timers')
const getOneFromHash = require('../../redis/getOneFromHash')
const handleError = require('../../utils/handleError')
const idleTimerBoot = require('./idleTimerBoot')

module.exports = async (idleTimerInstance) => {
  try {
    const bootOn = await getOneFromHash(idleTimerInstance, 'bootOn')

    const currentTime = Date.now()

    const bootTimer =
      setTimeout(() =>
        idleTimerBoot(idleTimerInstance), bootOn - currentTime
      )

    timers.insert({idleTimerInstance, bootTimer})
    return true
  }
  catch (err) {
    return handleError(err)
  }
}
