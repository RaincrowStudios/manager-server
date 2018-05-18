const timers = require('../database/timers')
const getActiveSet = require('../redis/getActiveSet')
const getAllFromHash = require('../redis/getAllFromHash')
const getOneFromHash = require('../redis/getOneFromHash')
const spiritDeath = require('../manager/spirits/spiritDeath')
const spiritExpire = require('../manager/spirits/spiritExpire')
const spiritMove = require('../manager/spirits/spiritMove')
const spiritAction = require('../manager/spirits/spiritAction')

async function initializeSpirits() {
  return new Promise(async (resolve, reject) => {
    try {
      const spirits = await getActiveSet('spirits')

      if (spirits.length) {
        for (let i = 0; i < spirits.length; i++) {
          if (spirits[i]) {
            const currentTime = Date.now()
            const spirit = await getAllFromHash(spirits[i])

            if (!spirit ||
              spirit.expireOn !== 0 && spirit.expireOn < currentTime) {
              spiritExpire(spirits[i])
            }
            else if (spirit.energy <= 0) {
              if (spirits[i].lastAttackedBy) {
                let killer
                const killerInfo =
                  await getAllFromHash(spirits[i].lastAttackedBy.instance)

                if (killerInfo.type === 'spirit') {
                  const spiritInfo =
                    await getOneFromHash('list:spirits', killerInfo.id)
                  killer = Object.assign(
                    {},
                    spiritInfo,
                    killerInfo,
                    {instance: spirits[i].lastAttackedBy.instance}
                  )
                }
                else {
                  killer = Object.assign(
                    {}, killerInfo, {instance: spirits[i].lastAttackedBy.instance}
                  )
                }

                spiritDeath(spirits[i], killer)
              }
              else {
                spiritExpire(spirits[i])
              }
            }
            else {
              let expireTimer
              if (spirit.expireOn) {
                expireTimer =
                  setTimeout(() =>
                    spiritExpire(spirits[i]),
                    spirit.expireOn - currentTime
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
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}

module.exports = initializeSpirits
