const timers = require('../../database/timers')
const getFieldsFromHash = require('../../redis/getFieldsFromHash')
const handleError = require('../../utils/handleError')
const spiritMove = require('./spiritMove')
const spiritAction = require('./spiritAction')

module.exports = async spiritInstance => {
  try {
    const { actionOn, moveOn } = await getFieldsFromHash(spiritInstance, [
      'actionOn',
      'moveOn'
    ])

    const currentTime = Date.now()

    const actionTimer = setTimeout(
      () => spiritAction(spiritInstance),
      actionOn - currentTime
    )

    let moveTimer
    if (moveOn) {
      moveTimer = setTimeout(
        () => spiritMove(spiritInstance),
        moveOn - currentTime
      )
    }

    timers.update(spiritTimers)

    let spiritTimers = timers.by('instance', spiritInstance)

    if (spiritTimers) {
      spiritTimers.actionTimer = actionTimer
      spiritTimers.moveTimer = moveTimer
      timers.update(spiritTimers)
    } else {
      spiritTimers = { instance: spiritInstance }
      spiritTimers.actionTimer = actionTimer
      spiritTimers.moveTimer = moveTimer
      timers.insert(spiritTimers)
    }

    return true
  } catch (err) {
    return handleError(err)
  }
}
