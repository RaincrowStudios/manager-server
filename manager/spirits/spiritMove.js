const timers = require('../../database/timers')
const resolveSpiritMove = require('./move/resolveSpiritMove')

async function spiritMove(instance, spirit) {
  try {
    const spiritAlive = timers.by('instance', instance)

    if (spiritAlive) {
      const currentTime = Date.now()
      const range = spirit.info.moveFreq.split('-')
      const min = parseInt(range[0], 10)
      const max = parseInt(range[1], 10)
      spirit.info.moveOn =
        currentTime +
        (Math.floor(Math.random() * (max - min + 1)) + min) * 60000

      let bound = false
      for (const condition of spirit.info.conditions) {
        if (condition.status === 'bound') {
          bound = true
        }
      }

      if (!bound) {
        await resolveSpiritMove(instance, spirit)
      }

      const newTimer =
        setTimeout(() =>
          spiritMove(instance, spirit), spirit.info.moveOn - currentTime
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
