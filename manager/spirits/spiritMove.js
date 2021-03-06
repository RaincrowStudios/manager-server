const timers = require('../../database/timers')
const getFieldsFromHash = require('../../redis/getFieldsFromHash')
const getOneFromList = require('../../redis/getOneFromList')
const updateHashField = require('../../redis/updateHashField')
const removeFromAll = require('../../redis/removeFromAll')
const handleError = require('../../utils/handleError')
const informGame = require('../../utils/informGame')

async function spiritMove(spiritInstance) {
  try {
    const update = []

    const { state, id, engagement, attributes } = await getFieldsFromHash(
      spiritInstance,
      ['state', 'id', 'engagement', 'attributes']
    )

    if (state === 'dead' || !id) {
      await removeFromAll('spirits', spiritInstance)
      return true
    }

    const spirit = await getOneFromList('spirits', id)

    const currentTime = Date.now()

    let newMoveOn, seconds
    if (spirit.moveFreq.includes('-')) {
      const range = spirit.moveFreq.split('-')
      const min = parseInt(range[0], 10)
      const max = parseInt(range[1], 10)

      seconds = Math.floor(Math.random() * (max - min + 1)) + min
    } else {
      seconds = parseInt(spirit.moveFreq, 10)
    }

    newMoveOn = currentTime + seconds * 1000

    update.push(updateHashField(spiritInstance, 'moveOn', newMoveOn))

    if (engagement && Object.keys(engagement).length) {
      const chance = attributes.includes('fleet') ? 0.5 : 0.1
      const roll = Math.random()

      if (roll <= chance) {
        update.push(
          informGame(spiritInstance, 'covens', 'head', 'covens/npe/move')
        )
      }
    } else {
      update.push(
        informGame(spiritInstance, 'covens', 'head', 'covens/npe/move')
      )
    }

    await Promise.all(update)

    const newTimer = setTimeout(
      () => spiritMove(spiritInstance),
      newMoveOn - currentTime
    )

    const spiritTimers = timers.by('instance', spiritInstance)
    if (spiritTimers) {
      spiritTimers.moveTimer = newTimer
      timers.update(spiritTimers)
    }
    return true
  } catch (err) {
    return handleError(err)
  }
}

module.exports = spiritMove
