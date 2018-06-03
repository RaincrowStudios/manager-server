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
           spirit.reach
         ),
         getNearbyFromGeohash(
          'collectibles',
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
       .filter(target => target && target.status !== 'dead')

      if (spirit.status === 'vulnerable') {
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

      for (let i = 0; i < spirit.moveTree.length; i++) {
        const directionCategory = spirit.moveTree[i].split(':')
        switch (directionCategory[0]) {
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
            destination = targetAll(spirit, nearTargets)
            break
          case 'attacker':
            if (spirit.lastAttackedBy) {
              destination =
                spirit.lastAttackedBy.type === 'spirit' ?
                  targetSpirits(spirit, nearTargets, directionCategory[0]) :
                  targetCharacters(spirit, nearTargets, directionCategory[0])
            }
            break
          case 'previousTarget':
            if (spirit.previousTarget) {
              destination =
                spirit.previousTarget.type === 'spirit' ?
                  targetSpirits(spirit, nearTargets, directionCategory[0]) :
                  targetCharacters(spirit, nearTargets, directionCategory[0])
            }
            break
          case 'collectible':
            if (spirit.carrying.length < spirit.maxCarry) {
              destination =
                targetCollectibles(spirit, nearTargets, directionCategory[1])
            }
            break
          case 'allies':
          case 'vulnerableAllies':
            destination = targetAllies(spirit, nearTargets, directionCategory[0])
            break
          case 'enemies':
          case 'vulnerableEnemies':
            destination = targetEnemies(spirit, nearTargets, directionCategory[0])
            break
          case 'spirits':
          case 'allySpirits':
          case 'enemySpirits':
            destination = targetSpirits(spirit, nearTargets, directionCategory[0])
            break
          case 'summoner':
            direction = 'summoner'
            break
          case 'portals':
            destination = targetPortals(spirit, nearTargets, directionCategory[0])
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
            destination = targetCharacters(spirit, nearTargets, directionCategory[0])
            break
          default:
            break
        }

        if (destination) {
          direction = [
            Math.sign(destination.latitude - spirit.latitude),
            Math.sign(destination.longitude - spirit.longitude),
          ]
        }
        resolve(direction)
      }

      resolve(false)
    }
    catch (err) {
      reject(err)
    }
  })
}
