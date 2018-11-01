const timers = require('../../database/timers')
const getFieldsFromHash = require('../../redis/getFieldsFromHash')
const handleError = require('../../utils/handleError')
const botAction = require('./botAction')
const botMove = require('./botMove')

module.exports = async (botInstance) => {
  try {
    const botTimers = timers.by('instance', botInstance)

    const {actionOn, moveOn} = await getFieldsFromHash(
      botInstance,
      ['actionOn', 'moveOn']
    )

    const currentTime = Date.now()

    const actionTimer =
      setTimeout(() =>
        botAction(botInstance),
        actionOn - currentTime
      )

    botTimers.actionTimer = actionTimer

    const moveTimer =
      setTimeout(() =>
        botMove(botInstance),
        moveOn - currentTime
      )

    botTimers.moveTimer = moveTimer

    timers.update(botTimers)

    return true
  }
  catch (err) {
    return handleError(err)
  }
}
