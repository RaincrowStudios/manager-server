const timers = require('../../database/timers')
const getAllFromHash = require('../../redis/getAllFromHash')
const getOneFromList = require('../../redis/getOneFromList')
const updateHashField = require('../../redis/updateHashField')
const handleError = require('../../utils/handleError')
const informGame = require('../../utils/informGame')

async function dukeAction(dukeInstanace) {
  try {
    const instanceInfo = await getAllFromHash(dukeInstanace)

    if (instanceInfo) {
      const dukeInfo = await getOneFromList('spirits', instanceInfo.id)

      const duke = Object.assign(
        {}, dukeInfo, instanceInfo,
      )

      const currentTime = Date.now()

      let newActionOn, seconds
      if (duke.phase[duke.currentPhase].actionFreq.includes('-')) {
        const range = duke.actionFreq.split('-')
        const min = parseInt(range[0], 10)
        const max = parseInt(range[1], 10)

        seconds = Math.floor(Math.random() * (max - min + 1)) + min
      }
      else {
        seconds = parseInt(duke.phase[duke.currentPhase], 10)
      }

      newActionOn = currentTime + (seconds * 1000)

      await Promise.all([
        informGame(dukeInstanace, 'covens', 'head', 'covens/npe/action'),
        updateHashField(dukeInstanace, 'actionOn', newActionOn)
      ])

      const newTimer =
        setTimeout(() =>
          dukeAction(dukeInstanace), newActionOn - currentTime
        )

      let dukeTimers = timers.by('instance', dukeInstanace)
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

module.exports = dukeAction
