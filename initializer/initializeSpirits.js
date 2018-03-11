const timers = require('../database/timers')
const getSetFromRedis = require('../utils/getSetFromRedis')
const getInfoFromRedis = require('../utils/getInfoFromRedis')
const spiritExpire = require('../manager/spirits/spiritExpire')
const spiritMove = require('../manager/spirits/spiritMove')
const spiritAction = require('../manager/spirits/spiritAction')

async function initializeSpirits() {
  try {
    const spirits = await getSetFromRedis('spirits')
    if (spirits !== []) {
      for (let i = 0; i < spirits.length; i++) {
        if (spirits[i]) {
          const currentTime = Date.now()
          const spirit = await getInfoFromRedis(spirits[i])
          console.log(spirit)
          if (spirit && spirit.expiresOn > currentTime && spirit.energy > 0) {
            const expireTimer =
              setTimeout(() =>
                spiritExpire(spirits[i], spirit),
                spirit.expiresOn - currentTime
              )

            const moveTimer =
              setTimeout(() =>
                spiritMove(spirits[i], spirit),
                spirit.moveOn > currentTime ?
                  spirit.moveOn - currentTime : 0
              )

            const actionTimer =
              setTimeout(() =>
                spiritAction(spirits[i], spirit),
                spirit.actionOn > currentTime ?
                  spirit.actionOn - currentTime : 0
              )

            timers.insert({
              instance: spirits[i],
              expireTimer,
              moveTimer,
              actionTimer
            })
          }
          else {
            spiritExpire(spirits[i], spirit)
          }
        }
      }
    }
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = initializeSpirits
