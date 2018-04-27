const timers = require('../../database/timers')
const spiritExpire = require('./spiritExpire')
const spiritMove = require('./spiritMove')
const spiritAction = require('./spiritAction')

module.exports = (spiritInstance, spirit) => {
  const currentTime = Date.now()
  const timer = {instance: spiritInstance}

  const expireTimer =
    setTimeout(() =>
      spiritExpire(spiritInstance),
      spirit.expiresOn - currentTime
    )

  timer.expireTimer = expireTimer


  const moveTimer =
    setTimeout(() =>
      spiritMove(spiritInstance),
      spirit.moveOn - currentTime
    )

  timer.moveTimer = moveTimer

  const actionTimer =
    setTimeout(() =>
      spiritAction(spiritInstance),
      spirit.actionOn - currentTime
    )
    
  timer.actionTimer = actionTimer

  timers.insert(timer)
  return true
}
