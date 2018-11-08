const clearTimers = require('../../utils/clearTimers')
const handleError = require('../../utils/handleError')
const informGame = require('../../utils/informGame')

module.exports = cooldownInstance => {
  try {
    clearTimers(cooldownInstance)

    return informGame(
      cooldownInstance,
      'covens',
      'head',
      'covens/cooldown/expire',
      1
    )
  } catch (err) {
    return handleError(err)
  }
}
