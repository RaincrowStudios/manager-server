const timers = require('../../database/timers')
const checkKeyExistance = require('../../redis/checkKeyExistance')
const getFieldsFromHash = require('../../redis/getFieldsFromHash')
const removeFromAll = require('../../redis/removeFromAll')
const handleError = require('../../utils/handleError')
const botAction = require('./botAction')
const botMove = require('./botMove')

module.exports = async botInstance => {
  try {
    const exists = await checkKeyExistance(botInstance)

    if (!exists) {
      await Promise.all([removeFromAll('bots'), removeFromAll('characters')])
      return true
    }

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

    return true
  } catch (err) {
    return handleError(err)
  }
}
