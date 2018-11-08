const timers = require('../../database/timers')
const getFieldsFromHash = require('../../redis/getFieldsFromHash')
const handleError = require('../../utils/handleError')
const botAction = require('./botAction')
const botMove = require('./botMove')

module.exports = async botInstance => {
  try {
    const { actionOn, moveOn } = await getFieldsFromHash(botInstance, [
      'actionOn',
      'moveOn'
    ])

    const currentTime = Date.now()

    const actionTimer = setTimeout(
      () => botAction(botInstance),
      actionOn - currentTime
    )

    const moveTimer = setTimeout(
      () => botMove(botInstance),
      moveOn - currentTime
    )

    let botTimers = timers.by('instance', botInstance)

    if (botTimers) {
      botTimers.actionTimer = actionTimer
      botTimers.moveTimer = moveTimer
      timers.update(botTimers)
    } else {
      botTimers = { instance: botInstance }
      botTimers.actionTimer = actionTimer
      botTimers.moveTimer = moveTimer
      timers.insert(botTimers)
    }

    return true
  } catch (err) {
    return handleError(err)
  }
}
