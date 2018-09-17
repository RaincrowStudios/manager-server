const clearTimers = require('../../utils/clearTimers')
const handleError = require('../../utils/handleError')
const informGame = require('../../utils/informGame')

module.exports = (collectibleInstance) => {
  try {
    clearTimers(collectibleInstance)

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
