const timers = require('../../database/timers')
const getAllFromHash = require('../../redis/getAllFromHash')
const getOneFromList = require('../../redis/getOneFromList')
const updateHashField = require('../../redis/updateHashField')
const handleError = require('../../utils/handleError')

async function dukeSummon(instance) {
  try {
    const instanceInfo = await getAllFromHash(instance)

    if (instanceInfo) {
      const dukeInfo = await getOneFromList('dukes', instanceInfo.id)

      const duke = Object.assign(
        {}, dukeInfo, instanceInfo,
      )

      //await handleDukeSummon(duke)

      const currentTime = Date.now()

      let newSummonOn, seconds
      if (duke.summonFreq.court.includes('-')) {
        const range = duke.actionFreq.split('-')
        const min = parseInt(range[0], 10)
        const max = parseInt(range[1], 10)

        seconds = Math.floor(Math.random() * (max - min + 1)) + min
      }
      else {
        seconds = parseInt(duke.court.summonFreq, 10)
      }

      newSummonOn = currentTime + (seconds * 1000)

      await updateHashField(duke.instance, 'actionOn', newSummonOn)

      const newTimer =
        setTimeout(() =>
          dukeSummon(duke.instance), newSummonOn - currentTime
        )

      let dukeTimers = timers.by('instance', duke.instance)
      if (dukeTimers) {
        dukeTimers.actionTimer = newTimer
        timers.update(dukeTimers)
      }
    }
    return true
  }
  catch (err) {
    return handleError(err)
  }
}

module.exports = dukeSummon
