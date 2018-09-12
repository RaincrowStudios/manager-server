const timers = require('../../database/timers')
const getAllFromHash = require('../../redis/getAllFromHash')
const getOneFromList = require('../../redis/getOneFromList')
const updateHashField = require('../../redis/updateHashField')
const handleError = require('../../utils/handleError')
const resolveDukeAction = require('./action/resolveDukeAction')

async function dukeAction(instance) {
  try {
    const instanceInfo = await getAllFromHash(instance)

    if (instanceInfo) {
      const dukeInfo = await getOneFromList('dukes', instanceInfo.id)

      const duke = Object.assign(
        {}, dukeInfo, instanceInfo,
      )

      const [update, inform] = await resolveDukeAction(duke)

      await Promise.all(update)

      for (const informObject of inform) {
        const informFunction = informObject.function
        await informFunction(...informObject.parameters)
      }

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

      await updateHashField(duke.instance, 'actionOn', newActionOn)

      const newTimer =
        setTimeout(() =>
          dukeAction(duke.instance), newActionOn - currentTime
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

module.exports = dukeAction
