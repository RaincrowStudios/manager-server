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

    const spiritTimers = timers.by('instance', spiritInstance)

    const currentTime = Date.now()

    if (spiritTimers && !spiritTimers.actionTimer) {
      const actionTimer = setTimeout(
        () => spiritAction(spiritInstance),
        actionOn - currentTime
      )
      spiritTimers.actionTimer = actionTimer
    }

    if (moveOn && spiritTimers && !spiritTimers.moveTimer) {
      const moveTimer = setTimeout(
        () => spiritMove(spiritInstance),
        moveOn - currentTime
      )

      spiritTimers.moveTimer = moveTimer
    }

    if (spiritTimers) {
      timers.update(spiritTimers)
    }

    return true
  } catch (err) {
    return handleError(err)
  }
}
