const timers = require('../../database/timers')
const resolveSpiritAction = require('./action/resolveSpiritAction')

async function spiritAction(instance, spirit) {
  try {
    const spiritAlive = timers.by('instance', instance)

    if (spiritAlive) {
      const currentTime = new Date()
      const range = spirit.info.actionFreq.split('-')
      const min = parseInt(range[0], 10)
      const max = parseInt(range[1], 10)
      spirit.info.actionOn =
        currentTime +
        (Math.floor(Math.random() * (max - min + 1)) + min) * 60000

      let silenced = false
      for (const condition of spirit.info.conditions) {
        if (condition.status === 'silenced') {
          silenced = true
        }
      }

      if (!silenced) {
        await resolveSpiritAction(instance, spirit)
      }

      const newTimer =
        setTimeout(() =>
          spiritAction(instance, spirit), spirit.info.actionOn - currentTime
        )

      let spiritTimers = timers.by('instance', instance)
      if (spiritTimers) {
        spiritTimers.actionTimer = newTimer
        timers.update(spiritTimers)
      }
    }
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = spiritAction
