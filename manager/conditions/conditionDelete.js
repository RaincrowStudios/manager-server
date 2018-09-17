const timers = require('../../database/timers')
const informGame = require('../../utils/informGame')

module.exports = (conditionInstance) => {
  const conditionTimers = timers.by('instance', conditionInstance)
  if (conditionTimers) {
    clearTimeout(conditionTimers.expireTimer)
    clearTimeout(conditionTimers.triggerTimer)
    timers.remove(conditionTimers)
  }

  return informGame(conditionInstance, 'covens', 'head', 'covens/condition/delete')
}
