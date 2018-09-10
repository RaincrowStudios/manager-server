const getNearbyFromGeohash = require('../../../redis/getNearbyFromGeohash')
const getAllFromHash = require('../../../redis/getAllFromHash')
const getOneFromHash = require('../../../redis/getOneFromHash')
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
      let destination = false
      let direction = false
      const [nearCharacters, nearCollectibles, nearPortals, nearSpirits] =
        await Promise.all([
          getNearbyFromGeohash(
            'characters',
            spirit.latitude,
            spirit.longitude,
            spirit.visionRange
          ),
          getNearbyFromGeohash(
            'collectibles',
            spirit.latitude,
            spirit.longitude,
            spirit.visionRange
          ),
          getNearbyFromGeohash(
            'portals',
            spirit.latitude,
            spirit.longitude,
            spirit.visionRange
          ),
          getNearbyFromGeohash(
            'spirits',
            spirit.latitude,
            spirit.longitude,
            spirit.visionRange
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
        }
      }
      else if (
        spirit.energy < spirit.baseEnergy &&
        spirit.attributes && spirit.attributes.includes('cowardly')
      ) {
        destination = await determineFlee(spirit, nearTargets)
      }
      else {
        for (let i = 0; i < spirit.moveTree.length; i++) {
          const [directionCategory, type] = spirit.moveTree[i].split(':')
          let summonerTarget

          switch (directionCategory) {
            case 'flee':
              destination = await determineFlee(spirit, nearTargets)
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
            case 'summonerTarget':
              summonerTarget =
                await getOneFromHash(spirit.owner, 'previousTarget')

              if (summonerTarget) {
                destination = nearTargets
                  .filter(target => target.instance === summonerTarget.instance)[0]
                }
              break
            case 'collectible':
              if (
                Object.keys(spirit.carrying).reduce((accumulator, carried) => {
                  return accumulator + carried.count
                }, 0) < spirit.maxCarry
              ) {
                destination = targetCollectibles(spirit, nearTargets, type)
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
              direction = await getAllFromHash(spirit.owner)
              break
            case 'summonerPortals':
            case 'portals':
              destination = targetPortals(spirit, nearTargets, directionCategory)
              break
            case 'summonLocation':
              destination = {latitude: spirit.summonLat, longitude: spirit.summonLong}
              break
            case 'vampires':
            case 'witches':
              destination = await targetCharacters(spirit, nearTargets, directionCategory)
              break
            default:
              break
          }

          if (destination) {
            break
          }
        }

        if (destination) {
          const y = Math.sin(destination.longitude - spirit.longitude) *
            Math.cos(destination.latitude)
          const x =
            Math.cos(spirit.latitude) * Math.sin(destination.latitude) -
            Math.sin(spirit.latitude) * Math.cos(destination.latitude) *
            Math.cos(destination.longitude - spirit.longitude)

          direction = Math.atan2(y, x).toDegrees()
        }
      }
      resolve(direction)
    }
    catch (err) {
      reject(err)
    }
  })
}
