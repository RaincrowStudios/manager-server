const addFieldToHash = require('../../../redis/addFieldToHash')
const getNearbyFromGeohash = require('../../../redis/getNearbyFromGeohash')
const getAllFromHash = require('../../../redis/getAllFromHash')
const informPlayers = require('../../../utils/informPlayers')
const targetAll = require('./targetAll')
const targetAllies = require('./targetAllies')
const targetCharacters = require('./targetCharacters')
const targetCollectibles = require('./targetCollectibles')
const targetEnemies = require('./targetEnemies')
const targetPortals = require('./targetPortals')
const targetSpirits = require('./targetSpirits')

module.exports = (spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
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

     const nearTargets = nearInfo
      .map((target, i) => {
         if (target) {
           target.instance = nearInstances[i]
           return target
         }
       })
       .filter(target => target && target.status !== 'dead')

      if (spirit.attributes && spirit.attributes.includes('sentinel')) {
        const nearEnemies = nearTargets
        .filter(target => target.instance !== spirit.instance && target.instance !== spirit.owner)
        .filter(target => !spirit.coven || target.coven !== spirit.coven)
        .map(target => target.instance)

      const update = []
      if (nearEnemies.length && spirit.sentinelList) {
        const newEnemies = nearEnemies
          .filter(instance => !spirit.sentinelList.includes(instance))

        if (newEnemies.length) {
          update.push(
            informPlayers(
              [spirit.player],
              {
                command: 'character_spirit_sentinel',
                instance: spirit.instance,
                spirit: spirit.displayName
              }
            )
          )
        }
      }
      update.push(addFieldToHash(spirit.instance, 'sentinelList', nearEnemies)
      )
      await Promise.all(update)
    }

     for (let i = 0; i < spirit.actionTree.length; i++) {
       const targetCategory = spirit.actionTree[i].target.split(':')

        let target
        switch (targetCategory[0]) {
          case 'self':
            target = spirit
            resolve([spirit, spirit.actionTree[i].actions])
            break
          case 'all':
            target = targetAll(spirit, nearTargets)
            break
          case 'attacker':
            if (spirit.lastAttackedBy) {
              target =
                spirit.lastAttackedBy.type === 'spirit' ?
                  targetSpirits(spirit, nearTargets, targetCategory[0]) :
                  targetCharacters(spirit, nearTargets, targetCategory[0])
            }
            break
          case 'previousTarget':
            if (spirit.previousTarget) {
              target =
                spirit.previousTarget.type === 'spirit' ?
                  targetSpirits(spirit, nearTargets, targetCategory[0]) :
                  targetCharacters(spirit, nearTargets, targetCategory[0])
            }
            break
          case 'collectible':
            if (spirit.carrying.length < spirit.maxCarry) {
              target = targetCollectibles(spirit, nearTargets, targetCategory[1])
            }
            break
          case 'allies':
          case 'vulnerableAllies':
            target = targetAllies(spirit, nearTargets, targetCategory[0])
            break
          case 'enemies':
          case 'vulnerableEnemies':
            target = targetEnemies(spirit, nearTargets, targetCategory[0])
            break
          case 'spirits':
          case 'allySpirits':
          case 'enemySpirits':
            target = targetSpirits(spirit, nearTargets, targetCategory[0])
            break
          case 'summoner':
            target = targetCharacters(spirit, nearTargets, targetCategory[1])
            break
          case 'summonerAttacker':
            break
          case 'summonerPortalAttacker':
            break
          case 'portals':
            target = targetPortals(spirit, nearTargets, targetCategory[0])
            break
          case 'vampires':
          case 'witches':
            target = targetCharacters(spirit, nearTargets, targetCategory[0])
            break
          default:
            break
        }
        if (target) {
          resolve([target, spirit.actionTree[i].actions])
        }
      }
      resolve([false, false])
    }
    catch (err) {
      reject(err)
    }
  })
}
