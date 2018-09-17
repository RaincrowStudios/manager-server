const timers = require('../../database/timers')
const handleError = require('../../utils/handleError')
const informGame = require('../../utils/informGame')

module.exports = (spiritInstance) => {
  try {
    const spiritTimers = timers.by('instance', spiritInstance)
    if (spiritTimers) {
      for (const timer of Object.values(spiritTimers))
      clearTimeout(timer)
      timers.remove(spiritTimers)
    }

    return informGame(spiritInstance, 'covens', 'head', 'covens/spirit/kill')
  }
  catch (err) {
    return handleError(err)
  }
}
