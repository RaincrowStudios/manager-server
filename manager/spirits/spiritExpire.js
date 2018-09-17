const handleError = require('../../utils/handleError')
const informGame = require('../../utils/informGame')

module.exports = (spiritInstance) => {
  try {
    return informGame(spiritInstance, 'covens', 'head', 'covens/spirit/expire')
  }
  catch (err) {
    return handleError(err)
  }
}
