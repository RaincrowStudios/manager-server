const timers = require('../../database/timers')
const getFieldsFromHash = require('../../redis/getFieldsFromHash')
const getOneFromList = require('../../redis/getOneFromList')
const updateHashField = require('../../redis/updateHashField')
const handleError = require('../../utils/handleError')
const informGame = require('../../utils/informGame')

async function dukeSummon(dukeInstanace) {
  try {
    const {id} = await getFieldsFromHash(dukeInstanace, ['id'])

    if (id) {
      const template = await getOneFromList('dukes', id)

      const summonFreq = template.court.summonFreq

      const currentTime = Date.now()

      let minutes
      if (summonFreq.includes('-')) {
        const range = summonFreq.split('-')
        const min = parseInt(range[0], 10)
        const max = parseInt(range[1], 10)

        minutes = Math.floor(Math.random() * (max - min + 1)) + min
      }
      else {
        minutes = parseInt(summonFreq, 10)
      }

      const newSummonOn = currentTime + (minutes * 60000)

      await Promise.all([
        informGame(dukeInstanace, 'covens', 'head', 'covens/npe/summon'),
        updateHashField(dukeInstanace, 'summonOn', newSummonOn)
      ])

      const newTimer =
        setTimeout(() =>
          dukeSummon(dukeInstanace), newSummonOn - currentTime
        )

      let dukeTimers = timers.by('instance', dukeInstanace)
      if (dukeTimers) {
        dukeTimers.summonTimer = newTimer
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
