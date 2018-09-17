const timers = require('../../database/timers')
const handleError = require('../../utils/handleError')
const informGame = require('../../utils/informGame')

module.exports = (conditionInstance) => {
  try {
    const conditionTimers = timers.by('instance', conditionInstance)
    if (conditionTimers) {
      for (const timer of Object.values(conditionTimers))
      clearTimeout(timer)
      timers.remove(conditionTimers)
    }

    return informGame(
      conditionInstance,
      'covens',
      'head',
      'covens/condition/expire'
    )
  }
  catch (err) {
    return handleError(err)
  }
}
