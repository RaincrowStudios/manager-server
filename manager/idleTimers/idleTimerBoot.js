const timers = require('../../database/timers')
const handleError = require('../../utils/handleError')
const informGame = require('../../utils/informGame')

module.exports = (idleTimerInstance) => {
  try {
    const idleTimers = timers.by('instance', idleTimerInstance)
    if (idleTimers) {
      for (const timer of Object.values(idleTimers))
      clearTimeout(timer)
      timers.remove(idleTimers)
    }

    return informGame(
      idleTimerInstance,
      'covens',
      'head',
      'covens/location/boot'
    )
  }
  catch (err) {
    return handleError(err)
  }
}
