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

    const botTimers = timers.by('instance', botInstance)

    const currentTime = Date.now()

    if (botTimers && !botTimers.actionTimer) {
      const actionTimer = setTimeout(
        () => botAction(botInstance),
        actionOn - currentTime
      )

      botTimers.actionTimer = actionTimer
    }

    if (botTimers && !botTimers.moveTimer) {
      const moveTimer = setTimeout(
        () => botMove(botInstance),
        moveOn - currentTime
      )

      botTimers.moveTimer = moveTimer
    }

    timers.update(botTimers)

    return true
  } catch (err) {
    return handleError(err)
  }
}
