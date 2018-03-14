const timers = require('../../database/timers')
const getAllFromHash = require('../../redis/getAllFromHash')
const resolveSpiritAction = require('./action/resolveSpiritAction')

async function spiritAction(instance) {
  try {
    const spirit = await getAllFromHash('spirits', instance)

    if (spirit) {
      const currentTime = Date.now()
      const range = spirit.actionFreq.split('-')
      const min = parseInt(range[0], 10)
      const max = parseInt(range[1], 10)

      spirit.actionOn = currentTime +
        (Math.floor(Math.random() * (max - min + 1)) + min) * 60000

      const silencedCheck =
        spirit.conditions.filter(condition => condition.status === 'silenced')

      if (silencedCheck.length <= 0) {
        await resolveSpiritAction(instance, spirit)
      }

      const newTimer =
        setTimeout(() =>
          spiritAction(instance), spirit.actionOn - currentTime
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
