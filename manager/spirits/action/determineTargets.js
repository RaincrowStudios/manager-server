const getNearbyFromGeohashByPoint = require('../../../utils/getNearbyFromGeohashByPoint')
const getAllFromRedis = require('../../../utils/getAllFromRedis')

module.exports = (instance, spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      for (let i = 0; i < spirit.targets.length; i++) {
        switch (spirit.targets[i]) {
          case 'self':
            resolve(['self', i])
            break
          case 'attacker':
            if (spirit.lastAttackBy) {
              const geohashCategory =
                spirit.lastAttackBy.type === 'spirit' ? 'Spirit' : 'Character'
              const targets =
                await getNearbyFromGeohashByPoint(
                  geohashCategory,
                  spirit.latitude,
                  spirit.longitude,
                  spirit.reach
                )
              for (const target of targets) {
                if (target[0] === spirit.lastAttackBy.instance) {
                  const redisInfo = await getAllFromRedis(target[0])
                  resolve([{
                    instance: target[0],
                    info: redisInfo.info,
                    mapSelection: redisInfo.mapSelection,
                    mapToken: redisInfo.mapToken
                  }, i])
                }
              }
            }
          case 'summoner':
          case 'summonerAttacker':
            break
          case 'witches':
          case 'vampires':
            const targetNames =
              await getNearbyFromGeohashByPoint(
                'Characters',
                spirit.latitude,
                spirit.longitude,
                spirit.reach
              )
            break
          case 'places':
          case 'portals':
          case 'spirits':
            const geohashCategory =
              spirit.targets[i].charAt(0).toUpperCase() + spirit.targets[i].slice(1)
            const targets =
              await getNearbyFromGeohashByPoint(
                geohashCategory,
                spirit.latitude,
                spirit.longitude,
                spirit.reach
              )
            for (let i = 0; i < targets.length; i++) {
              if (targets[i][0] === instance) {
                targets.splice(i, 1)
              }
            }

            if (targets.length !== 0) {
              const target = targets[Math.floor(Math.random() * targets.length)][0]
              const redisInfo = await getAllFromRedis(target)
              resolve([{
                instance: target,
                info: redisInfo.info,
                mapSelection: redisInfo.mapSelection,
                mapToken: redisInfo.mapToken
              }, i])
            }
          default:
            break
        }
      }
      resolve([false, false])
    }
    catch (err) {
      reject(err)
    }
  })
}
