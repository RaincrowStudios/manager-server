const timers = require('../../database/timers')
const handleError = require('../../utils/handleError')
const informGame = require('../../utils/informGame')

module.exports = (immunityInstance) => {
  try {
    const immunityTimers = timers.by('instance', immunityInstance)
    if (immunityTimers) {
      for (const timer of Object.values(immunityTimers))
      clearTimeout(timer)
      timers.remove(immunityTimers)
    }

    return informGame(
      immunityInstance,
      'covens',
      'head',
      'covens/immunity/expire'
    )
  }
  catch (err) {
    return handleError(err)
  }
}
