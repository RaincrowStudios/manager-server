const getNearbyFromGeohashByPoint = require('../../../utils/getNearbyFromGeohashByPoint')
const getInfoFromRedis = require('../../../utils/getInfoFromRedis')

module.exports = (instance, spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      const nearTokens = await Promise.all([
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

      let nearCharacters,
        nearCollectibles,
        nearPlaces,
        nearPortals,
        nearSpirits

      [nearCharacters,
        nearCollectibles,
        nearPlaces,
        nearPortals,
        nearSpirits] = nearTokens

      for (let i = 0; i < spirit.targets.length; i++) {
        switch (spirit.targets[i]) {
          case 'self':
            resolve([null, 'self', i])
            break
          case 'collectibles':
            if (nearCollectibles.length !== 0) {
              const collectible =
                nearCollectibles[
                  Math.floor(Math.random() * nearCollectibles.length)
                ][0]

              const info = await getInfoFromRedis(collectible)

              resolve([collectible, info, i])
            }
            break
          case 'attacker':
            if (spirit.lastAttackedBy) {
              const attackerType =
                spirit.lastAttackedBy.type === 'spirit' ?
                  nearSpirits : nearCharacters

              if (attackerType.length !== 0) {
                for (const target of attackerType) {
                  if (target[0] === spirit.lastAttackedBy.instance) {
                    const info = await getInfoFromRedis(target[0])
                    if (info) {
                      resolve([target[0], info, i])
                    }
                  }
                }
              }
            }
            break
          case 'previousTarget':
            if (spirit.previousTarget) {
              const targetType =
                spirit.previousTarget.type === 'spirit' ?
                  nearSpirits : nearCharacters

              if (targetType.length !== 0) {
                for (const target of targetType) {
                  if (target[0] === spirit.previousTarget.instance) {
                    const info = await getInfoFromRedis(target[0])
                    if (info) {
                      resolve([target[0], info, i])
                    }
                  }
                }
              }
            }
            break
          case 'allies':
          case 'enemies':
            if (
              nearCharacters.length !== 0 ||
              nearSpirits.length !== 0
            ) {

              const redisQuery = []
              for (let i = 0; i < nearCharacters.length; i++) {
                redisQuery.push(getInfoFromRedis(nearCharacters[i][0]))
              }
              for (let i = 0; i < nearSpirits.length; i++) {
                redisQuery.push(getInfoFromRedis(nearSpirits[i][0]))
              }

              const info = await Promise.all(redisQuery)

              if (spirit.targets[i] === 'allies') {
                const allies = []
                const alliesInfo = []
                for (let i = 0; i < nearCharacters.length; i++) {
                  if (Math.sign(info[i].degree) === Math.sign(spirit.degree)) {
                    allies.push(nearCharacters[i][0])
                    alliesInfo.push(info[i])
                  }
                }
                for (let i = 0; i < nearSpirits.length; i++) {
                  if (Math.sign(info[i].degree) === Math.sign(spirit.degree)) {
                    allies.push(nearSpirits[i][0])
                    alliesInfo.push(info[i])
                  }
                }

                if (allies.length > 0) {
                  const index = Math.floor(Math.random() * allies.length)
                  resolve([allies[index], alliesInfo[index], i])
                }
              }
              else {
                const enemies = []
                const enemiesInfo = []
                for (let i = 0; i < nearCharacters.length; i++) {
                  if (Math.sign(info[i].degree) !== Math.sign(spirit.degree)) {
                    enemies.push(nearCharacters[i][0])
                    enemiesInfo.push(info[i])
                  }
                }
                for (let i = 0; i < nearSpirits.length; i++) {
                  if (Math.sign(info[i].degree) !== Math.sign(spirit.degree)) {
                    enemies.push(nearSpirits[i][0])
                    enemiesInfo.push(info[i])
                  }
                }

                if (enemies.length > 0) {
                  const index = Math.floor(Math.random() * enemies.length)
                  resolve([enemies[index], enemiesInfo[index], i])
                }
              }
            }
            break
          case 'summoner':
            if (nearCharacters.length !== 0) {
              for (const target of nearCharacters) {
                if (target[0] === spirit.owner) {
                  const info = await getInfoFromRedis(spirit.owner)
                  resolve([target[0], info, i])
                }
              }
            }
            break
          case 'summonerAttacker':
            break
          case 'summonerPortalAttacker':
            break
          case 'places':
            if (nearPlaces.length !== 0) {
              const target = nearSpirits[
                Math.floor(Math.random() * nearSpirits.length)
              ][0]
              const info = await getInfoFromRedis(target)
              if (info) {
                resolve([target, info, i])
              }
            }
            break
          case 'portals':
            if (nearPortals.length !== 0) {
              const target = nearSpirits[
                Math.floor(Math.random() * nearSpirits.length)
              ][0]
              const info = await getInfoFromRedis(target)
              if (info) {
                resolve([target, info, i])
              }
            }
            break
          case 'spirits':
            for (let i = 0; i < nearSpirits.length; i++) {
              if (nearSpirits[i][0] === instance) {
                nearSpirits.splice(i, 1)
              }
            }

            if (nearSpirits.length !== 0) {
              const target =
                nearSpirits[
                  Math.floor(Math.random() * nearSpirits.length)
                ][0]
              const info = await getInfoFromRedis(target)
              if (info) {
                resolve([target, info, i])
              }
            }
            break
          case 'vampires':
          case 'witches':
            if (nearCharacters.length !== 0) {
              do {
                const index =
                  Math.floor(Math.random() * nearCharacters.length)
                const target = nearCharacters[index][0]

                const info = await getInfoFromRedis(target)
                if (info.type === spirit.targets[i]) {
                  resolve([target[0], info, i])
                }
                else {
                  nearCharacters.splice(index, 1)
                }
              }
              while (nearCharacters.length > 0)
            }
            break
          default:
            break
        }
      }
      resolve([false, false, false])
    }
    catch (err) {
      reject(err)
    }
  })
}
