const timers = require('../../database/timers')
const handleError = require('../../utils/handleError')
const informGame = require('../../utils/informGame')

module.exports = async (portalInstance) => {
  try {
    const portalTimers = timers.by('instance', portalInstance)
    if (portalTimers) {
      for (const timer of Object.values(portalTimers))
      clearTimeout(timer)
      timers.remove(portalTimers)
    }

    return informGame(
      portalInstance,
      'covens',
      'head',
      'covens/portal/summon'
    )
  }
  catch (err) {
    return handleError(err)
  }
}
