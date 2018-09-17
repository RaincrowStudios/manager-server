const timers = require('../../database/timers')
const getFieldsFromHash = require('../../redis/getFieldsFromHash')
const handleError = require('../../utils/handleError')
const spiritExpire = require('./spiritExpire')
const spiritMove = require('./spiritMove')
const spiritAction = require('./spiritAction')

module.exports = async (spiritInstance) => {
  try {
    const currentTime = Date.now()
    const timer = {instance: spiritInstance}

    const [expiresOn, moveOn, actionOn] =
      await getFieldsFromHash(spiritInstance, ['expiresOn', 'moveOn', 'actionOn'])

    if (expiresOn) {
      const expireTimer =
        setTimeout(() =>
          spiritExpire(spiritInstance),
          expiresOn - currentTime
        )

      timer.expireTimer = expireTimer
    }

    if (moveOn) {
      const moveTimer =
        setTimeout(() =>
          spiritMove(spiritInstance),
          moveOn - currentTime
        )

      timer.moveTimer = moveTimer
    }

    console.log('adding action timer')
    const actionTimer =
      setTimeout(() =>
        spiritAction(spiritInstance),
        actionOn - currentTime
      )

    timer.actionTimer = actionTimer

    timers.insert(timer)

    return true
  }
  catch (err) {
    return handleError(err)
  }
}
