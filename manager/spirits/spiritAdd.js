const timers = require('../../database/timers')
const spiritExpire = require('./spiritExpire')
const spiritMove = require('./spiritMove')
const spiritAction = require('./spiritAction')

module.exports = (spiritInstance, spirit) => {
  const currentTime = Date.now()

  const expireTimer =
    setTimeout(() =>
      spiritExpire(spiritInstance),
      spirit.expiresOn - currentTime
    )

  const moveTimer =
    setTimeout(() =>
      spiritMove(spiritInstance),
      spirit.moveOn - currentTime
    )

  const actionTimer =
    setTimeout(() =>
      spiritAction(spiritInstance),
      spirit.actionOn - currentTime
    )

  timers.insert({spiritInstance, expireTimer, moveTimer, actionTimer})

  return true
}
