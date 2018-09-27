const timers = require('../../database/timers')
const getFieldsFromHash = require('../../redis/getFieldsFromHash')
const getOneFromList = require('../../redis/getOneFromList')
const updateHashField = require('../../redis/updateHashField')
const handleError = require('../../utils/handleError')
const informGame = require('../../utils/informGame')

async function dukeAction(dukeInstanace) {
  try {
        const {id, currentPhase} = await getFieldsFromHash(
          dukeInstanace,
          ['id', 'currentPhase']
        )

    if (id) {
        const template = await getOneFromList('dukes', id)

      const actionFreq = template.phase[currentPhase].actionFreq

      const currentTime = Date.now()

      let seconds
      if (actionFreq.includes('-')) {
        const range = actionFreq.split('-')
        const min = parseInt(range[0], 10)
        const max = parseInt(range[1], 10)

        seconds = Math.floor(Math.random() * (max - min + 1)) + min
      }
      else {
        seconds = parseInt(actionFreq, 10)
      }

      const newActionOn = currentTime + (seconds * 1000)

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
