const timers = require('../../database/timers')
const getAllFromHash = require('../../redis/getAllFromHash')
const getOneFromList = require('../../redis/getOneFromList')
const removeFromAll = require('../../redis/removeFromAll')
const updateHashField = require('../../redis/updateHashField')
const resolveSpiritAction = require('./action/resolveSpiritAction')

async function spiritAction(spiritInstance) {
  try {
    const instanceInfo = await getAllFromHash(spiritInstance)

    if (instanceInfo) {
      if (!instanceInfo.id) {
        await removeFromAll('spirits', spiritInstance)
        return true
      }

      const spiritInfo = await getOneFromList('spirits', instanceInfo.id)

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

      let newActionOn, seconds
      if (spirit.actionFreq.includes('-')) {
        const range = spirit.actionFreq.split('-')
        const min = parseInt(range[0], 10)
        const max = parseInt(range[1], 10)

        seconds = Math.floor(Math.random() * (max - min + 1)) + min
      }
      else {
        seconds = parseInt(spirit.actionFreq, 10)
      }

      if (spirit.bloodlustCount) {
        seconds = seconds - spirit.bloodlustCount > 1 ?
          seconds - spirit.bloodlustCount : 1
      }

      newActionOn = currentTime + (seconds * 1000)

      await updateHashField(spirit.instance, 'actionOn', newActionOn)

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
    return true
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = spiritAction
