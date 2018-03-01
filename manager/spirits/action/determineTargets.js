const getNearbyFromGeohashByPoint = require('../../../utils/getNearbyFromGeohashByPoint')
const getAllFromRedis = require('../../../utils/getAllFromRedis')

module.exports = (instance, spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      const nearByTokens = await Promise.all([
        getNearbyFromGeohashByPoint(
          'Characters',
          spirit.latitude,
          spirit.longitude,
          spirit.reach
        ),
        getNearbyFromGeohashByPoint(
          'Collectibles',
          spirit.latitude,
          spirit.longitude,
          spirit.reach
        ),
        getNearbyFromGeohashByPoint(
          'Places',
          spirit.latitude,
          spirit.longitude,
          spirit.reach
        ),
        getNearbyFromGeohashByPoint(
          'Characters',
          spirit.latitude,
          spirit.longitude,
          spirit.reach
        ),
        getNearbyFromGeohashByPoint(
          'Spirits',
          spirit.latitude,
          spirit.longitude,
          spirit.reach
        )
      ])

      let nearByCharacters,
        nearByCollectibles,
        nearByPlaces,
        nearByPortals,
        nearBySpirits

      [nearByCharacters,
        nearByCollectibles,
        nearByPlaces,
        nearByPortals,
        nearBySpirits] = nearByTokens

      for (let i = 0; i < spirit.targets.length; i++) {
        switch (spirit.targets[i]) {
          case 'self':
            resolve(['self', i])
            break
          case 'attacker':
            if (spirit.lastAttackBy) {
              const attackerType =
                spirit.lastAttackBy.type === 'spirit' ?
                  nearBySpirits : nearByCharacters

              if (attackerType.length !== 0) {
                for (const target of attackerType) {
                  if (target[0] === spirit.lastAttackBy.instance) {
                    const redisInfo = await getAllFromRedis(target[0])
                    if (redisInfo) {
                      resolve([
                        {
                          instance: target[0],
                          info: redisInfo.info,
                          mapSelection: redisInfo.mapSelection,
                          mapToken: redisInfo.mapToken
                        },
                        i
                      ])
                    }
                  }
                }
              }
            }
          case 'previousTarget':
            if (spirit.previousTarget) {
              const targetType =
                spirit.previousTarget.type === 'spirit' ?
                  nearBySpirits : nearByCharacters

              if (targetType.length !== 0) {
                for (const target of targetType) {
                  if (target[0] === spirit.previousTarget.instance) {
                    const redisInfo = await getAllFromRedis(target[0])
                    if (redisInfo) {
                      resolve([
                        {
                          instance: target[0],
                          info: redisInfo.info,
                          mapSelection: redisInfo.mapSelection,
                          mapToken: redisInfo.mapToken
                        },
                        i
                      ])
                    }
                  }
                }
              }
            }
          case 'summoner':
            if (nearByCharacters.length !== 0) {
              for (const target of nearByCharacters) {
                if (target[0] === spirit.owner) {
                  const redisInfo = await getAllFromRedis(spirit.owner)
                  resolve([
                    {
                      instance: target[0],
                      info: redisInfo.info,
                      mapSelection: redisInfo.mapSelection,
                      mapToken: redisInfo.mapToken
                    },
                    i
                  ])
                }
              }
            }
          case 'summonerAttacker':
            break
          case 'summonerPortalAttacker':
            break
          case 'places':
            if (nearByPlaces.length !== 0) {
              const target = nearBySpirits[
                Math.floor(Math.random() * nearBySpirits.length)
              ][0]
              const redisInfo = await getAllFromRedis(target)
              if (redisInfo) {
                resolve([
                  {
                    instance: target,
                    info: redisInfo.info,
                    mapSelection: redisInfo.mapSelection,
                    mapToken: redisInfo.mapToken
                  },
                  i
                ])
              }
            }
          case 'portals':
            if (nearByPortals.length !== 0) {
              const target = nearBySpirits[
                Math.floor(Math.random() * nearBySpirits.length)
              ][0]
              const redisInfo = await getAllFromRedis(target)
              if (redisInfo) {
                resolve([
                  {
                    instance: target,
                    info: redisInfo.info,
                    mapSelection: redisInfo.mapSelection,
                    mapToken: redisInfo.mapToken
                  },
                  i
                ])
              }
            }
          case 'spirits':
            for (let i = 0; i < nearBySpirits.length; i++) {
              if (nearBySpirits[i][0] === instance) {
                nearBySpirits.splice(i, 1)
              }
            }

            if (nearBySpirits.length !== 0) {
              const target =
                nearBySpirits[
                  Math.floor(Math.random() * nearBySpirits.length)
                ][0]
              const redisInfo = await getAllFromRedis(target)
              if (redisInfo) {
                resolve([
                  {
                    instance: target,
                    info: redisInfo.info,
                    mapSelection: redisInfo.mapSelection,
                    mapToken: redisInfo.mapToken
                  },
                  i
                ])
              }
            }
          case 'vampires':
          case 'witches':
            if (nearByCharacters.length !== 0) {
              do {
                const index =
                  Math.floor(Math.random() * nearByCharacters.length)
                const target = nearByCharacters[index][0]

                const redisInfo = await getAllFromRedis(target)
                if (redisInfo.info.type === spirit.targets[i]) {
                  resolve([
                    {
                      instance: target[0],
                      info: redisInfo.info,
                      mapSelection: redisInfo.mapSelection,
                      mapToken: redisInfo.mapToken
                    },
                    i
                  ])
                }
                else {
                  nearByCharacters.splice(index, 1)
                }
              }
              while (nearByCharacters.length > 0)
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
