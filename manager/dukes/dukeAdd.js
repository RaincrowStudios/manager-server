const timers = require('../../database/timers')
const getFieldsFromHash = require('../../redis/getFieldsFromHash')
const handleError = require('../../utils/handleError')
const dukeAction = require('./dukeAction')
const dukeExpire = require('./dukeExpire')
const dukeMove = require('./dukeMove')
const dukeSummon = require('./dukeSummon')

module.exports = async (dukeInstanace) => {
  try {
    const currentTime = Date.now()
    const timer = {instance: dukeInstanace}

    const [actionOn, moveOn, summonOn, expiresOn] =
      await getFieldsFromHash(
        dukeInstanace,
        ['actionOn', 'moveOn', 'summonOn', 'expiresOn']
      )

    const actionTimer =
      setTimeout(() =>
        dukeAction(dukeInstanace),
        actionOn - currentTime
      )

    timer.actionTimer = actionTimer

    if (moveOn) {
      const moveTimer =
        setTimeout(() =>
          dukeMove(dukeInstanace),
          moveOn - currentTime
        )

      timer.moveTimer = moveTimer
    }

    if (summonOn) {
      const summonTimer =
        setTimeout(() =>
          dukeSummon(dukeInstanace),
          summonOn - currentTime
        )

      timer.summonTimer = summonTimer
    }

    if (expiresOn) {
      const expireTimer =
        setTimeout(() =>
          dukeExpire(dukeInstanace),
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
