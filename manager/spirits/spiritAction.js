const timers = require('../../database/timers')
const addFieldsToHash = require('../../redis/addFieldsToHash')
const getAllFromHash = require('../../redis/getAllFromHash')
const resolveSpiritAction = require('./action/resolveSpiritAction')

async function spiritAction(spiritInstance) {
  try {
    const spirit = await getAllFromHash(spiritInstance)

    if (spirit) {
      const currentTime = Date.now()
      const range = spirit.actionFreq.split('-')
      const min = parseInt(range[0], 10)
      const max = parseInt(range[1], 10)

      const newActionOn = currentTime +
        (Math.floor(Math.random() * (max - min + 1)) + min) * 1000

      const silencedCheck =
        spirit.conditions.filter(condition => condition.status === 'silenced')

      if (silencedCheck.length <= 0) {
        await resolveSpiritAction(spiritInstance, spirit)
      }

      const newTimer =
        setTimeout(() =>
          spiritAction(spiritInstance), newActionOn - currentTime
        )

      await addFieldsToHash(spiritInstance, ['actionOn'], [newActionOn])

      let spiritTimers = timers.by('instance', spiritInstance)
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
