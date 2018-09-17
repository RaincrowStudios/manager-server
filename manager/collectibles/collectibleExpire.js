const handleError = require('../../utils/handleError')
const informGame = require('../../utils/informGame')

module.exports = async (collectibleInstance) => {
  try {
    informGame(collectibleInstance, 'covens', 'head', 'covens/collectible/expire')
    return true
  }
  catch (err) {
    return handleError(err)
  }
}
