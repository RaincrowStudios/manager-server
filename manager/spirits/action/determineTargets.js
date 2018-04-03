const getNearbyFromGeohash = require('../../../redis/getNearbyFromGeohash')
const getAllFromHash = require('../../../redis/getAllFromHash')

module.exports = (instance, spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      const nearTokens = await Promise.all([
        getNearbyFromGeohash(
          'characters',
          spirit.latitude,
          spirit.longitude,
          spirit.reach
        ),
        getNearbyFromGeohash(
          'collectibles',
          spirit.latitude,
          spirit.longitude,
          spirit.reach
        ),
        getNearbyFromGeohash(
          'places',
          spirit.latitude,
          spirit.longitude,
          spirit.reach
        ),
        getNearbyFromGeohash(
          'portals',
          spirit.latitude,
          spirit.longitude,
          spirit.reach
        ),
        getNearbyFromGeohash(
          'spirits',
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
            resolve([instance, 'self', spirit.actionTree[i].actions])
            break
          case 'collectibles':
            if (spirit.carrying.length < spirit.maxCarry) {
              if (nearCollectibles.length > 0) {
                let instance, info
                if (targetCategory[1]) {
                  const nearCollectiblesInfo = await Promise.all(
                    nearCollectibles.map(item => getAllFromHash(item))
                  )
                  for (let j = 0; j < nearCollectiblesInfo.length; j++) {
                    if (
                      nearCollectiblesInfo[j].id === targetCategory[1] ||
                      nearCollectiblesInfo[j].type === targetCategory[1]
                    ) {
                      instance = nearCollectibles[j]
                      info = nearCollectiblesInfo[j]
                    }
                  }
                }
                else {
                  instance =
                    nearCollectibles[
                      Math.floor(Math.random() * nearCollectibles.length)
                    ]

                  info = await getAllFromHash(instance)
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
                  if (target === spirit.lastAttackedBy.instance) {
                    const info = await getAllFromHash(target)

                    if (info) {
                      resolve([target, info, spirit.actionTree[i].actions])
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
                  if (target === spirit.previousTarget.instance) {
                    const info = await getAllFromHash(target)

                    if (info) {
                      resolve([target, info, spirit.actionTree[i].actions])
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
                redisQuery.push(getAllFromHash(nearCharacters[i]))
              }
              for (let i = 0; i < nearSpirits.length; i++) {
                redisQuery.push(getAllFromHash(nearSpirits[i]))
              }

              const info = await Promise.all(redisQuery)

              if (targetCategory === 'allies') {
                const allies = []
                const alliesInfo = []
                for (let i = 0; i < nearCharacters.length; i++) {
                  if (Math.sign(info[i].degree) === Math.sign(spirit.degree)) {
                    allies.push(nearCharacters[i])
                    alliesInfo.push(info[i])
                  }
                }
                for (let i = 0; i < nearSpirits.length; i++) {
                  if (Math.sign(info[i].degree) === Math.sign(spirit.degree)) {
                    allies.push(nearSpirits[i])
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
                    enemies.push(nearCharacters[i])
                    enemiesInfo.push(info[i])
                  }
                }
                for (let i = 0; i < nearSpirits.length; i++) {
                  if (Math.sign(info[i].degree) !== Math.sign(spirit.degree)) {
                    enemies.push(nearSpirits[i])
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
                redisQuery.push(getAllFromHash(nearSpirits[i]))
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
                    allies.push(nearSpirits[i])
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
                    enemies.push(nearSpirits[i])
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
                if (target === spirit.owner) {
                  const info = await getAllFromHash(spirit.owner)

                  if (info) {
                    resolve([target, info, spirit.actionTree[i].actions])
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
              ]
              const info = await getAllFromHash(instance)

              if (info) {
                resolve([instance, info, spirit.actionTree[i].actions])
              }
            }
            break
          case 'portals':
            if (nearPortals.length > 0) {
              const instance = nearPortals[
                Math.floor(Math.random() * nearPortals.length)
              ]
              const info = await getAllFromHash(instance)

              if (info) {
                resolve([instance, info, spirit.actionTree[i].actions])
              }
            }
            break
          case 'spirits':
            for (let i = 0; i < nearSpirits.length; i++) {
              if (nearSpirits[i] === instance) {
                nearSpirits.splice(i, 1)
              }
            }

            if (nearSpirits.length > 0) {
              const instance =
                nearSpirits[
                  Math.floor(Math.random() * nearSpirits.length)
                ]
              const info = await getAllFromHash(instance)

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
                const characterName = nearCharacters[index]

                const info = await getAllFromHash(characterName)
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
