const timers = require('../../database/timers')
const getFieldsFromHash = require('../../redis/getFieldsFromHash')
const getOneFromList = require('../../redis/getOneFromList')
const updateHashField = require('../../redis/updateHashField')
const removeFromAll = require('../../redis/removeFromAll')
const handleError = require('../../utils/handleError')
const informGame = require('../../utils/informGame')

async function spiritMove(spiritInstance) {
  try {
    const [state, id] = await getFieldsFromHash(spiritInstance, ['state', 'id'])

    if (state === 'dead' || !id) {
      await removeFromAll('spirits', spiritInstance)
      return true
    }

    const spirit = await getOneFromList('spirits', id)

    const currentTime = Date.now()

    let newMoveOn
    if (spirit.moveFreq.includes('-')) {
      const range = spirit.moveFreq.split('-')
      const min = parseInt(range[0], 10)
      const max = parseInt(range[1], 10)

      newMoveOn = currentTime +
        ((Math.floor(Math.random() * (max - min + 1)) + min) * 1000)
    }
    else {
      newMoveOn = parseInt(spirit.moveFreq, 10)
    }

    await Promise.all([
      informGame(spiritInstance, 'covens', 'head', 'covens/npe/move'),
      updateHashField(spiritInstance, 'moveOn', newMoveOn)
    ])

    const newTimer =
      setTimeout(() =>
        spiritMove(spiritInstance), newMoveOn - currentTime
      )

    const spiritTimers = timers.by('instance', spiritInstance)
    if (spiritTimers) {
      spiritTimers.moveTimer = newTimer
      timers.update(spiritTimers)
    }
    return true
  }
  catch (err) {
    return handleError(err)
  }
}

module.exports = spiritMove
