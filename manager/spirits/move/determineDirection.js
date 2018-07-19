const getNearbyFromGeohash = require('../../../redis/getNearbyFromGeohash')
const getAllFromHash = require('../../../redis/getAllFromHash')
const targetAll = require('../target/targetAll')
const targetAllies = require('../target/targetAllies')
const targetCharacters = require('../target/targetCharacters')
const targetCollectibles = require('../target/targetCollectibles')
const targetEnemies = require('../target/targetEnemies')
const targetPortals = require('../target/targetPortals')
const targetSpirits = require('../target/targetSpirits')
const determineFlee = require('./determineFlee')

module.exports = (spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      let destination
      let direction = false
      const [nearCharacters, nearCollectibles, nearPortals, nearSpirits] =
        await Promise.all([
          getNearbyFromGeohash(
            'characters',
            spirit.latitude,
            spirit.longitude,
            spirit.visionRange,
            50
          ),
          getNearbyFromGeohash(
            'collectibles',
            spirit.latitude,
            spirit.longitude,
            spirit.visionRange,
            50
          ),
          getNearbyFromGeohash(
            'portals',
            spirit.latitude,
            spirit.longitude,
            spirit.visionRange,
            50
          ),
          getNearbyFromGeohash(
            'spirits',
            spirit.latitude,
            spirit.longitude,
            spirit.visionRange,
            50
          )
        ])

    const nearInstances =
      [...nearCharacters, ...nearCollectibles, ...nearPortals, ...nearSpirits]
        .filter(instance => instance !== spirit.instance)

    const nearInfo = await Promise.all(
      nearInstances.map(instance => getAllFromHash(instance))
    )

    const nearTargets = nearInfo.map((target, i) => {
        if (target) {
          target.instance = nearInstances[i]
          return target
        }
      })
      .filter(target => target && target.state !== 'dead')

    if (spirit.state === 'vulnerable') {
      if (!spirit.attributes || !spirit.attributes.includes('stubborn')) {
        destination = await determineFlee(spirit, nearTargets)

        if (destination) {
          direction = [
            Math.sign(destination.latitude - spirit.latitude),
            Math.sign(destination.longitude - spirit.longitude),
          ]

          resolve(direction)
        }
      }
    }
    else if (
      spirit.energy < spirit.baseEnergy &&
      spirit.attributes && spirit.attributes.includes('cowardly')
    ) {
      destination = await determineFlee(spirit, nearTargets)

      if (destination) {
        direction = [
          Math.sign(destination.latitude - spirit.latitude),
          Math.sign(destination.longitude - spirit.longitude),
        ]

      resolve(direction)
      }
    }
    else {
      for (let i = 0; i < spirit.moveTree.length; i++) {
        const [directionCategory, type] = spirit.moveTree[i].split(':')
        switch (directionCategory) {
          case 'flee':
            destination = await determineFlee(spirit, nearTargets)
            if (destination) {
              direction = [
                Math.sign(destination.latitude - spirit.latitude),
                Math.sign(destination.longitude - spirit.longitude),
              ]
              resolve(direction)
            }
            break
          case 'all':
          case 'vulnerableAll':
            destination = targetAll(spirit, nearTargets)
            break
          case 'attacker':
            if (spirit.lastAttackedBy) {
              destination =
                spirit.lastAttackedBy.type === 'spirit' ?
                  targetSpirits(spirit, nearTargets, directionCategory) :
                  await targetCharacters(spirit, nearTargets, directionCategory)
            }
            break
          case 'previousTarget':
            if (spirit.previousTarget) {
              destination =
                spirit.previousTarget.type === 'spirit' ?
                  targetSpirits(spirit, nearTargets, directionCategory) :
                  await targetCharacters(spirit, nearTargets, directionCategory)
            }
            break
          case 'collectible':
            if (spirit.carrying.length < spirit.maxCarry) {
              destination =
                targetCollectibles(spirit, nearTargets, type)
            }
            break
          case 'allies':
          case 'vulnerableAllies':
            destination = targetAllies(spirit, nearTargets, directionCategory)
            break
          case 'enemies':
          case 'vulnerableEnemies':
            destination = targetEnemies(spirit, nearTargets, directionCategory)
            break
          case 'spirits':
          case 'allySpirits':
          case 'enemySpirits':
            destination = targetSpirits(spirit, nearTargets, directionCategory)
            break
          case 'summoner':
            direction = 'summoner'
            break
          case 'summonerPortals':
          case 'portals':
            destination = targetPortals(spirit, nearTargets, directionCategory)
            break
          case 'summonLocation':
            direction = [
              Math.sign(spirit.summonLat - spirit.latitude),
              Math.sign(spirit.summonLong - spirit.longitude),
            ]

            resolve(direction)
            break
          case 'vampires':
          case 'witches':
            destination = await targetCharacters(spirit, nearTargets, directionCategory)
            break
          default:
            break
        }

        if (destination) {
          direction = [
            Math.sign(parseFloat(destination.latitude, 10) - parseFloat(spirit.latitude, 10)),
            Math.sign(parseFloat(destination.longitude, 10) - parseFloat(spirit.longitude, 10)),
          ]
        }

        resolve(direction)
      }

      resolve(false)
    }
    }
    catch (err) {
      reject(err)
    }
  })
}
