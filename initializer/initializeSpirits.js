const timers = require('../database/timers')
const getActiveSet = require('../redis/getActiveSet')
const getAllFromHash = require('../redis/getAllFromHash')
const spiritExpire = require('../manager/spirits/spiritExpire')
const spiritMove = require('../manager/spirits/spiritMove')
const spiritAction = require('../manager/spirits/spiritAction')

async function initializeSpirits() {
  try {
    const spirits = await getActiveSet('spirits')
    if (spirits.length > 0) {
      for (let i = 0; i < spirits.length; i++) {
        if (spirits[i]) {
          const currentTime = Date.now()
          const spirit = await getAllFromHash('spirits', spirits[i])

          if (spirit && spirit.expiresOn > currentTime && spirit.energy > 0) {
            const expireTimer =
              setTimeout(() =>
                spiritExpire(spirits[i]),
                spirit.expiresOn - currentTime
              )
            console.log('Spirit expiring in %d minutes...', (spirit.expiresOn - currentTime)/60000)
            const moveTimer =
              setTimeout(() =>
                spiritMove(spirits[i]),
                spirit.moveOn > currentTime ?
                  spirit.moveOn - currentTime : 0
              )
            console.log('Spirit moving in %d seconds...', (spirit.moveOn - currentTime)/1000)
            const actionTimer =
              setTimeout(() =>
                spiritAction(spirits[i]),
                spirit.actionOn > currentTime ?
                  spirit.actionOn - currentTime : 0
              )
            console.log('Spirit acting in %d seconds...', (spirit.actionOn - currentTime)/1000)
            timers.insert({
              instance: spirits[i],
              expireTimer,
              moveTimer,
              actionTimer
            })
          }
          else {
            spiritExpire(spirits[i])
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
