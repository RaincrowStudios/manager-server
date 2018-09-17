const clearTimers = require('../../utils/clearTimers')
const handleError = require('../../utils/handleError')
const informGame = require('../../utils/informGame')

module.exports = (loreInstance) => {
  try {
    clearTimers(loreInstance)

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
