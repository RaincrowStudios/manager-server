const timers = require('../../database/timers')
const handleError = require('../../utils/handleError')
const informGame = require('../../utils/informGame')

module.exports = (collectibleInstance) => {
  try {
    const collectibleTimers = timers.by('instance', collectibleInstance)
    if (collectibleTimers) {
      for (const timer of Object.values(collectibleTimers))
      clearTimeout(timer)
      timers.remove(collectibleTimers)
    }

    return informGame(
      collectibleInstance,
      'covens',
      'head',
      'covens/collectible/expire'
    )
  }
  catch (err) {
    return handleError(err)
  }
}
