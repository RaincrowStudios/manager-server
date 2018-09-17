const timers = require('../../database/timers')
const handleError = require('../../utils/handleError')
const informGame = require('../../utils/informGame')

module.exports = (loreInstance) => {
  try {
    const loreTimers = timers.by('instance', loreInstance)
    if (loreTimers) {
      for (const timer of Object.values(loreTimers))
      clearTimeout(timer)
      timers.remove(loreTimers)
    }

    return informGame(
      loreInstance,
      'covens',
      'head',
      'covens/lore/expire'
    )
  }
  catch (err) {
    return handleError(err)
  }
}
