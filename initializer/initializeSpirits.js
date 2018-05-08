const timers = require('../database/timers')
const getActiveSet = require('../redis/getActiveSet')
const getAllFromHash = require('../redis/getAllFromHash')
const spiritExpire = require('../manager/spirits/spiritExpire')
const spiritMove = require('../manager/spirits/spiritMove')
const spiritAction = require('../manager/spirits/spiritAction')

async function initializeSpirits() {
  try {
    const spirits = await getActiveSet('spirits')
    if (spirits.length) {
      for (let i = 0; i < spirits.length; i++) {
        if (spirits[i]) {
          const currentTime = Date.now()
          const spirit = await getAllFromHash(spirits[i])

          if (spirit.expiresOn === 0 && spirit.expiresOn < currentTime) {
            spiritExpire(spirits[i])
          }
          else if (spirit.energy <= 0) {
            spiritExpire(spirits[i])
          }
          else {
            let expireTimer
            if (spirit.expiresOn) {
              expireTimer =
                setTimeout(() =>
                  spiritExpire(spirits[i]),
                  spirit.expiresOn - currentTime
                )
            }

            const moveTimer =
              setTimeout(() =>
                spiritMove(spirits[i]),
                spirit.moveOn > currentTime ?
                  spirit.moveOn - currentTime : 0
              )

            const actionTimer =
              setTimeout(() =>
                spiritAction(spirits[i]),
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
        }
      }
    }
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = initializeSpirits
