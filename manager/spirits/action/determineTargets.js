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

      for (let i = 0; i < spirit.actionTree.length; i++) {
        const targetCategory = spirit.actionTree[i].target.split(':')

        switch (targetCategory[0]) {
          case 'self':
            resolve([false, 'self', spirit.actionTree[i].actions])
            break
          case 'collectibles':
            if (spirit.carrying.length < spirit.maxCarry) {
              if (nearCollectibles.length > 0) {
                let instance, info
                if (targetCategory[1]) {
                  const nearCollectiblesInfo = await Promise.all(
                    nearCollectibles.map(item => getInfoFromRedis(item[0]))
                  )
                  for (let j = 0; j < nearCollectiblesInfo.length; j++) {
                    if (
                      nearCollectiblesInfo[j].id === targetCategory[1] ||
                      nearCollectiblesInfo[j].type === targetCategory[1]
                    ) {
                      instance = nearCollectibles[j][0]
                      info = nearCollectiblesInfo[j]
                    }
                  }
                }
                else {
                  instance =
                    nearCollectibles[
                      Math.floor(Math.random() * nearCollectibles.length)
                    ][0]

                  info = await getInfoFromRedis(instance)
                }
                if (info) {
                  resolve([instance, info, spirit.actionTree[i].actions])
                }
              }
            }
            break
          case 'attacker':
            if (spirit.lastAttackedBy) {
              const attackerType =
                spirit.lastAttackedBy.type === 'spirit' ?
                  nearSpirits : nearCharacters

              if (attackerType.length > 0) {
                for (const target of attackerType) {
                  if (target[0] === spirit.lastAttackedBy.instance) {
                    const info = await getInfoFromRedis(target[0])

                    if (info) {
                      resolve([target[0], info, spirit.actionTree[i].actions])
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

              if (targetType.length > 0) {
                for (const target of targetType) {
                  if (target[0] === spirit.previousTarget.instance) {
                    const info = await getInfoFromRedis(target[0])

                    if (info) {
                      resolve([target[0], info, spirit.actionTree[i].actions])
                    }
                  }
                }
              }
            }
            break
          case 'allies':
          case 'enemies':
            if (
              nearCharacters.length > 0 ||
              nearSpirits.length > 0
            ) {

              const redisQuery = []
              for (let i = 0; i < nearCharacters.length; i++) {
                redisQuery.push(getInfoFromRedis(nearCharacters[i][0]))
              }
              for (let i = 0; i < nearSpirits.length; i++) {
                redisQuery.push(getInfoFromRedis(nearSpirits[i][0]))
              }

              const info = await Promise.all(redisQuery)

              if (targetCategory === 'allies') {
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

                  resolve([
                    allies[index],
                    alliesInfo[index],
                    spirit.actionTree[i].actions
                  ])
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

                  resolve([
                    enemies[index],
                    enemiesInfo[index],
                    spirit.actionTree[i].actions
                  ])
                }
              }
            }
            break
          case 'allySpirits':
          case 'enemySpirits':
            if (
              nearCharacters.length > 0 ||
              nearSpirits.length > 0
            ) {

              const redisQuery = []
              for (let i = 0; i < nearSpirits.length; i++) {
                redisQuery.push(getInfoFromRedis(nearSpirits[i][0]))
              }

              const info = await Promise.all(redisQuery)

              if (targetCategory === 'allySpirits') {
                const allies = []
                const alliesInfo = []
                for (let i = 0; i < nearSpirits.length; i++) {
                  if (
                    info[i] &&
                    Math.sign(info[i].degree) === Math.sign(spirit.degree)
                  ) {
                    allies.push(nearSpirits[i][0])
                    alliesInfo.push(info[i])
                  }
                }

                if (allies.length > 0) {
                  const index = Math.floor(Math.random() * allies.length)

                  resolve([
                    allies[index],
                    alliesInfo[index],
                    spirit.actionTree[i].actions
                  ])
                }
              }
              else {
                const enemies = []
                const enemiesInfo = []
                for (let i = 0; i < nearSpirits.length; i++) {
                  if (
                    info[i] &&
                    Math.sign(info[i].degree) !== Math.sign(spirit.degree)
                  ) {
                    enemies.push(nearSpirits[i][0])
                    enemiesInfo.push(info[i])
                  }
                }

                if (enemies.length > 0) {
                  const index = Math.floor(Math.random() * enemies.length)

                  resolve([
                    enemies[index],
                    enemiesInfo[index],
                    spirit.actionTree[i].actions
                  ])
                }
              }
            }
            break
          case 'summoner':
            if (nearCharacters.length > 0) {
              for (const target of nearCharacters) {
                if (target[0] === spirit.owner) {
                  const info = await getInfoFromRedis(spirit.owner)

                  if (info) {
                    resolve([target[0], info, spirit.actionTree[i].actions])
                  }
                }
              }
            }
            break
          case 'summonerAttacker':
            break
          case 'summonerPortalAttacker':
            break
          case 'places':
            if (nearPlaces.length > 0) {
              const instance = nearPlaces[
                Math.floor(Math.random() * nearPlaces.length)
              ][0]
              const info = await getInfoFromRedis(instance)

              if (info) {
                resolve([instance, info, spirit.actionTree[i].actions])
              }
            }
            break
          case 'portals':
            if (nearPortals.length > 0) {
              const instance = nearPortals[
                Math.floor(Math.random() * nearPortals.length)
              ][0]
              const info = await getInfoFromRedis(instance)

              if (info) {
                resolve([instance, info, spirit.actionTree[i].actions])
              }
            }
            break
          case 'spirits':
            for (let i = 0; i < nearSpirits.length; i++) {
              if (nearSpirits[i][0] === instance) {
                nearSpirits.splice(i, 1)
              }
            }

            if (nearSpirits.length > 0) {
              const instance =
                nearSpirits[
                  Math.floor(Math.random() * nearSpirits.length)
                ][0]
              const info = await getInfoFromRedis(instance)

              if (info) {
                resolve([instance, info, spirit.actionTree[i].actions])
              }
            }
            break
          case 'vampires':
          case 'witches':
            if (nearCharacters.length > 0) {
              do {
                const index =
                  Math.floor(Math.random() * nearCharacters.length)
                const characterName = nearCharacters[index][0]

                const info = await getInfoFromRedis(characterName)
                if (info.type === targetCategory) {
                  resolve([characterName, info, spirit.actionTree[i].actions])
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
