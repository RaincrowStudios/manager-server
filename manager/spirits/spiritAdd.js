const timers = require('../../database/timers')
const spiritExpire = require('./spiritExpire')
const spiritMove = require('./spiritMove')
const spiritAction = require('./spiritAction')

module.exports = (instance, spirit) => {
  const expireTimer =
    setTimeout(spiritExpire(instance), spirit.expiresOn)

  const moveTimer =
    setTimeout(spiritMove(instance), spirit.nextMove)

  const actionTimer =
    setTimeout(spiritAction(instance), spirit.nextAction)

  timers.insert({instance, expireTimer, moveTimer, actionTimer})

  return true
}
