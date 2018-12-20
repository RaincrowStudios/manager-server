const timers = require('../../database/timers')
const checkKeyExistance = require('../../redis/checkKeyExistance')
const getFieldsFromHash = require('../../redis/getFieldsFromHash')
const removeFromAll = require('../../redis/removeFromAll')
const addToSet = require('../../redis/addToSet')
const removeFromSet = require('../../redis/removeFromSet')
const handleError = require('../../utils/handleError')
const getNearPlayers = require('../../utils/getNearPlayers')
const botAction = require('./botAction')
const botMove = require('./botMove')

module.exports = async botInstance => {
  try {
    const exists = await checkKeyExistance(botInstance)
    if (!exists) {
      await Promise.all([removeFromAll('bots'), removeFromAll('characters')])
      return true
    }

    await addToSet('set:active:bots', botInstance)

    const { actionOn, moveOn } = await getFieldsFromHash(botInstance, [
      'actionOn',
      'moveOn'
    ])

    let botTimers = timers.by('instance', botInstance)
    let newTimer = false
    if (!botTimers) {
      newTimer = true
      botTimers = { instance: botInstance }
    }

    const currentTime = Date.now()

    if (!botTimers.actionTimer) {
      const actionTimer = setTimeout(
        () => botAction(botInstance),
        actionOn - currentTime
      )

      botTimers.actionTimer = actionTimer
    }

    if (!botTimers.moveTimer) {
      const moveTimer = setTimeout(
        () => botMove(botInstance),
        moveOn - currentTime
      )

      botTimers.moveTimer = moveTimer
    }

    if (newTimer) {
      timers.insert(botTimers)
    } else {
      timers.update(botTimers)
    }

    const checkPlayers = setInterval(async () => {
      const nearPlayers = await getNearPlayers(botInstance)
      if (nearPlayers.length === 0) {
        try {
          await removeFromSet('set:active:bots', botInstance)
          await addToSet('set:inactive:bots', botInstance)
          clearInterval(checkPlayers)
        } catch (error) {
          return handleError(error)
        }
      }
    }, 5 * 60 * 1000)

    return true
  } catch (err) {
    return handleError(err)
  }
}
