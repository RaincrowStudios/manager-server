const timers = require('../../database/timers')
const informLogger = require('../../utils/informLogger')
const spiritExpire = require('./spiritExpire')
const spiritMove = require('./spiritMove')
const spiritAction = require('./spiritAction')

module.exports = (spiritInstance, spirit) => {
  const currentTime = Date.now()
  const timer = {instance: spiritInstance}

  if (spirit.expiresOn) {
    const expireTimer =
      setTimeout(() =>
        spiritExpire(spiritInstance),
        spirit.expiresOn - currentTime
      )

    timer.expireTimer = expireTimer
  }

  if (spirit.moveOn) {
    const moveTimer =
      setTimeout(() =>
        spiritMove(spiritInstance),
        spirit.moveOn - currentTime
      )

    timer.moveTimer = moveTimer
  }

  const actionTimer =
    setTimeout(() =>
      spiritAction(spiritInstance),
      spirit.actionOn - currentTime
    )

  timer.actionTimer = actionTimer

  timers.insert(timer)
  
  informLogger({
    route: 'spiritSummon',
  	character_id: spirit.owner,
    spirit_id: spiritInstance,
    latitude: spirit.summonLat,
    longitude: spirit.summonLong,
    ingredient_1: "",
    ingredient_2: "",
    ingredient_3: "",
    pop_id: ""
  })

  return true
}
