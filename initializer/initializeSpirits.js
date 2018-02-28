const timers = require('../database/timers')
const getSetFromRedis = require('../utils/getSetFromRedis')
const getAllFromRedis = require('../utils/getAllFromRedis')
const spiritExpire = require('../manager/spirits/spiritExpire')
const spiritMove = require('../manager/spirits/spiritMove')
const spiritAction = require('../manager/spirits/spiritAction')

async function initializeSpirits() {
  try {
    const spirits = await getSetFromRedis('spirits')
    if (spirits !== []) {
      for (let i = spirits.length - 1; i >= 0; i--) {
        const currentTime = Date.now()
        const spirit = await getAllFromRedis(spirits[i])

        if (spirit.info.expiresOn > currentTime && spirit.info.energy > 0) {
          const expireTimer =
            setTimeout(() =>
              spiritExpire(spirits[i], spirit),
              spirit.info.expiresOn - currentTime
            )

          const moveTimer =
            setTimeout(() =>
              spiritMove(spirits[i], spirit),
              spirit.info.moveOn > currentTime ?
                spirit.info.moveOn - currentTime : 0
            )

          const actionTimer =
            setTimeout(() =>
              spiritAction(spirits[i], spirit),
              spirit.info.actionOn > currentTime ?
                spirit.info.actionOn - currentTime : 0
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
  catch (err) {
    console.error(err)
  }
}

module.exports = initializeSpirits
