const timers = require('../../database/timers')
const addFieldsToHash = require('../../redis/addFieldsToHash')
const getAllFromHash = require('../../redis/getAllFromHash')
const getOneFromHash = require('../../redis/getOneFromHash')
const resolveSpiritAction = require('./action/resolveSpiritAction')

async function spiritAction(spiritInstance) {
  try {
    const instanceInfo = await getAllFromHash(spiritInstance)

    if (instanceInfo) {
      const spiritInfo = await getOneFromHash('list:spirits', instanceInfo.id)

      const spirit = Object.assign(
        {}, spiritInfo, instanceInfo, {instance: spiritInstance}
      )

      if (
        !spirit.conditions
          .map(condition => condition.status)
          .includes('silenced')
      ) {
        await resolveSpiritAction(spirit)
      }

      const currentTime = Date.now()

      let newActionOn
      if (spirit.actionFreq.includes('-')) {
        const range = spirit.actionFreq.split('-')
        const min = parseInt(range[0], 10)
        const max = parseInt(range[1], 10)

        newActionOn = currentTime +
          ((Math.floor(Math.random() * (max - min + 1)) + min) * 1000)
      }
      else {
        newActionOn = parseInt(spirit.actionFreq, 10)
      }

      await addFieldsToHash(spirit.instance, ['actionOn'], [newActionOn])

      const newTimer =
        setTimeout(() =>
          spiritAction(spirit.instance), newActionOn - currentTime
        )

      let spiritTimers = timers.by('instance', spirit.instance)
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
