const timers = require('../../database/timers')
const getFieldsFromHash = require('../../redis/getFieldsFromHash')
const handleError = require('../../utils/handleError')
const botAction = require('./botAction')
const botMove = require('./botMove')

module.exports = async (botInstance) => {
  try {
    const currentTime = Date.now()
    const timer = {instance: botInstance}

    const [actionOn, moveOn] =
      await getFieldsFromHash(botInstance, ['actionOn', 'moveOn'])

    const actionTimer =
      setTimeout(() =>
        botAction(botInstance),
        actionOn - currentTime
      )

    timer.actionTimer = actionTimer

    const moveTimer =
      setTimeout(() =>
        botMove(botInstance),
        moveOn - currentTime
      )

    timer.moveTimer = moveTimer


    timers.insert(timer)

    return true
  }
  catch (err) {
    return handleError(err)
  }
}
