const timers = require('../../database/timers')
const spiritExpire = require('./spiritExpire')
const spiritMove = require('./spiritMove')
const spiritAction = require('./spiritAction')

module.exports = (instance, spirit) => {
  const currentTime = Date.now()

  console.log('Spirit expiring in %d seconds...', (spirit.expiresOn - currentTime) / 1000)

  const expireTimer =
    setTimeout(() =>
      spiritExpire(instance),
      spirit.expiresOn - currentTime
    )

  const moveTimer =
    setTimeout(() =>
      spiritMove(instance),
      0
    )

  const actionTimer =
    setTimeout(() =>
      spiritAction(instance),
      0
    )

  timers.insert({instance, expireTimer, moveTimer, actionTimer})

  return true
}
