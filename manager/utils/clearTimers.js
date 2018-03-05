const timers = require('../../database/timers')

module.exports = (instance) => {
  const instanceTimers = timers.by('instance', instance)
  if (instanceTimers) {
    for (const key of Object.keys(instanceTimers))
    clearTimeout(instanceTimers[key])
  }
  timers.remove(instanceTimers)
}
