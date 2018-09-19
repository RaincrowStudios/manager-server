const timers = require('../../database/timers')
const getAllFromHash = require('../../redis/getAllFromHash')
const getOneFromList = require('../../redis/getOneFromList')
const updateHashField = require('../../redis/updateHashField')
const handleError = require('../../utils/handleError')

async function spiritSummon(spiritInstance) {
  try {
    const instanceInfo = await getAllFromHash(spiritInstance)

    if (instanceInfo) {
      const spiritTemplate = await getOneFromList('dukes', instanceInfo.id)

      const spirit = Object.assign(
        {}, spiritTemplate, instanceInfo,
      )

      //await handleDukeSummon(duke)

      const currentTime = Date.now()

      let newSummonOn, seconds
      if (spirit.summonFreq.includes('-')) {
        const range = spirit.summonFreq.split('-')
        const min = parseInt(range[0], 10)
        const max = parseInt(range[1], 10)

        seconds = Math.floor(Math.random() * (max - min + 1)) + min
      }
      else {
        seconds = parseInt(spirit.summonFreq, 10)
      }

      newSummonOn = currentTime + (seconds * 1000)

      await Promise.all([
        informGame(spiritInstance, 'covens', 'head', 'covens/npe/summon'),
        updateHashField(spiritInstance, 'summonOn', newSummonOn)
      ])

      const newTimer =
        setTimeout(() =>
          spiritSummon(spiritInstance), newSummonOn - currentTime
        )

      let spiritTimers = timers.by('instance', spiritInstance)
      if (spiritTimers) {
        spiritTimers.summonTimer = newTimer
        timers.update(spiritTimers)
      }
    }
    return true
  }
  catch (err) {
    return handleError(err)
  }
}

module.exports = spiritSummon
