const clearTimers = require('../../utils/clearTimers')
const handleError = require('../../utils/handleError')
const informGame = require('../../utils/informGame')

module.exports = (portalInstance) => {
  try {
    clearTimers(portalInstance)

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
