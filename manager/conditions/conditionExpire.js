const informGame = require('../../utils/informGame')

module.exports = (conditionInstance) => {
  return informGame(
    conditionInstance,
    'covens',
    'head',
    'covens/condition/expire'
  )
}
