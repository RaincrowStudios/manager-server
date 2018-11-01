const timers = require('../database/timers')

module.exports = (instance) => {
  const timersToClear = timers.by('instance', instance)

  if (timersToClear) {
    for (const key of Object.keys(timersToClear)) {
      if (key === 'actionTimer' || key === 'moveTimer') {
        clearTimeout(timersToClear[key])
        timers.update(timersToClear)
      }
    }
  }
}
