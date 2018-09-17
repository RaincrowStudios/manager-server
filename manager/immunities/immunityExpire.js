const clearTimers = require('../../utils/clearTimers')
const handleError = require('../../utils/handleError')
const informGame = require('../../utils/informGame')

module.exports = (immunityInstance) => {
  try {
    clearTimers(immunityInstance)

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
