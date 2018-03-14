const timers = require('../../database/timers')
const getAllFromHash = require('../../redis/getAllFromHash')
const resolveSpiritMove = require('./move/resolveSpiritMove')

async function spiritMove(instance) {
  try {
    const spirit = await getAllFromHash('spirits', instance)

    if (spirit) {
      const currentTime = Date.now()
      const range = spirit.moveFreq.split('-')
      const min = parseInt(range[0], 10)
      const max = parseInt(range[1], 10)

      spirit.moveOn = currentTime +
        (Math.floor(Math.random() * (max - min + 1)) + min) * 60000

      const boundCheck =
        spirit.conditions.filter(condition => condition.status === 'bound')

      if (boundCheck.length <= 0) {
        await resolveSpiritMove(instance, spirit)
      }

      const newTimer =
        setTimeout(() =>
          spiritMove(instance), spirit.moveOn - currentTime
        )

      let spiritTimers = timers.by('instance', instance)
      if (spiritTimers) {
        spiritTimers.moveTimer = newTimer
        timers.update(spiritTimers)
      }
    }
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = spiritMove
