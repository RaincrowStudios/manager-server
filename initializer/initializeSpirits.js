const timers = require('../database/timers')
const getToInstanceSet = require('../redis/getToInstanceSet')
const getFieldsFromHash = require('../redis/getFieldsFromHash')
const spiritExpire = require('../manager/spirits/spiritExpire')
const spiritMove = require('../manager/spirits/spiritMove')
const spiritAction = require('../manager/spirits/spiritAction')

async function initializeSpirits() {
  try {
    const spirits = await getToInstanceSet('spirits')
    if (spirits !== []) {
      for (let i = 0; i < spirits.length; i++) {
        if (spirits[i]) {
          const currentTime = Date.now()
          const spirit = await getFieldsFromHash(spirits[i], ['energy', 'expiresOn', 'moveOn', 'actionOn'])

          if (spirit && spirit.expiresOn > currentTime && spirit.energy > 0) {
            const expireTimer =
              setTimeout(() =>
                spiritExpire(spirits[i]),
                spirit.expiresOn - currentTime
              )

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
