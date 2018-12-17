const timers = require('../../database/timers')
const getFieldsFromHash = require('../../redis/getFieldsFromHash')
const getOneFromList = require('../../redis/getOneFromList')
const removeFromAll = require('../../redis/removeFromAll')
const updateHashField = require('../../redis/updateHashField')
const handleError = require('../../utils/handleError')
const informGame = require('../../utils/informGame')
const checkActivity = require('../../utils/checkActivity')

async function spiritAction(spiritInstance) {
  try {
    const { state, id } = await getFieldsFromHash(spiritInstance, [
      'state',
      'id'
    ])

    if (state === 'dead' || !id) {
      await removeFromAll('spirits', spiritInstance)
      return true
    }

    const spirit = await getOneFromList('spirits', id)

    const currentTime = Date.now()

    let newActionOn, seconds
    if (spirit.actionFreq.includes('-')) {
      const range = spirit.actionFreq.split('-')
      const min = parseInt(range[0], 10)
      const max = parseInt(range[1], 10)

      seconds = Math.floor(Math.random() * (max - min + 1)) + min
    } else {
      seconds = parseInt(spirit.actionFreq, 10)
    }

    if (spirit.bloodlustCount) {
      seconds =
        seconds - spirit.bloodlustCount > 1
          ? seconds - spirit.bloodlustCount
          : 1
    }

    newActionOn = currentTime + seconds * 1000

    let shouldPerformAction = await checkActivity(spiritInstance, 'move')

    if (shouldPerformAction) {
      await Promise.all([
        informGame(spiritInstance, 'covens', 'head', 'covens/npe/action'),
        updateHashField(spiritInstance, 'actionOn', newActionOn)
      ])
    }

    const newTimer = setTimeout(
      () => spiritAction(spiritInstance),
      newActionOn - currentTime
    )

    const spiritTimers = timers.by('instance', spiritInstance)
    if (spiritTimers) {
      spiritTimers.actionTimer = newTimer
      timers.update(spiritTimers)
    }
    return true
  } catch (err) {
    return handleError(err)
  }
}

module.exports = spiritAction
