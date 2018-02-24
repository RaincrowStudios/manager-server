const timers = require('../../database/timers')
const spiritExpire = require('./spiritExpire')
const spiritMove = require('./spiritMove')
const spiritAction = require('./spiritAction')

module.exports = (instance, spirit) => {
  const expireTimer =
    setTimeout(spiritExpire(instance, spirit), spirit.info.expiresOn)

  const moveTimer =
    setTimeout(spiritMove(instance, spirit), spirit.info.nextMove)

  const actionTimer =
    setTimeout(spiritAction(instance, spirit), spirit.info.nextAction)

  timers.insert({instance, expireTimer, moveTimer, actionTimer})

  return true
}
