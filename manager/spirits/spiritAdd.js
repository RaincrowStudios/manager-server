const timers = require('../../database/timers')
const getFieldsFromHash = require('../../redis/getFieldsFromHash')
const handleError = require('../../utils/handleError')
const spiritExpire = require('./spiritExpire')
const spiritMove = require('./spiritMove')
const spiritAction = require('./spiritAction')

module.exports = async (spiritInstance) => {
  try {
    const timer = {instance: spiritInstance}

    const {actionOn, moveOn, expiresOn} = await getFieldsFromHash(
      spiritInstance,
      ['actionOn', 'moveOn', 'expiresOn']
    )

    const currentTime = Date.now()

    const actionTimer =
      setTimeout(() =>
        spiritAction(spiritInstance),
        actionOn - currentTime
      )

    timer.actionTimer = actionTimer

    if (moveOn) {
      const moveTimer =
        setTimeout(() =>
          spiritMove(spiritInstance),
          moveOn - currentTime
        )

      timer.moveTimer = moveTimer
    }

    if (expiresOn) {
      const expireTimer =
        setTimeout(() =>
          spiritExpire(spiritInstance),
          expiresOn - currentTime
        )

      timer.expireTimer = expireTimer
    }

    timers.insert(timer)

    return true
  }
  catch (err) {
    return handleError(err)
  }
}
