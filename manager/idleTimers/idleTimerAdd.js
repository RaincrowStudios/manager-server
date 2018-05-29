const timers = require('../../database/timers')
const idleTimerBoot = require('./idleTimerBoot')

module.exports = (idleTimerInstance, idleTimer) => {
  try {
    const currentTime = Date.now()

    const bootTimer =
      setTimeout(() =>
        idleTimerBoot(idleTimerInstance), idleTimer.bootOn - currentTime
      )

    timers.insert({idleTimerInstance, bootTimer})
  }
  catch (err) {
    console.error(err)
  }
}
