const getNearbyFromGeohash = require('../../../redis/getNearbyFromGeohash')
const getAllFromHash = require('../../../redis/getAllFromHash')
const getOneFromHash = require('../../../redis/getOneFromHash')
const updateHashField = require('../../../redis/updateHashField')
const informPlayers = require('../../../utils/informPlayers')
const targetAll = require('./targetAll')
const targetAllies = require('./targetAllies')
const targetCharacters = require('./targetCharacters')
const targetCollectibles = require('./targetCollectibles')
const targetDead = require('./targetDead')
const targetEnemies = require('./targetEnemies')
const targetPortals = require('./targetPortals')
const targetSpirits = require('./targetSpirits')

module.exports = (spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      let nearTargets

      if (spirit.coven) {
        spirit.allies = await getOneFromHash(spirit.coven, 'allies')
      }

      if (spirit.location) {
        const location = await getAllFromHash(spirit.location)

        const nearInstances = [
          ...Object.keys(location.occupants),
          ...Object.keys(location.spirits)
            .filter(instance => instance !== spirit.instance)
        ]

        nearTargets = await Promise.all(
          nearInstances.map(instance => getAllFromHash(instance))
        )
      }
      else {
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

        nearTargets = await Promise.all(
          nearInstances.map(instance => getAllFromHash(instance))
        )

        nearTargets = nearTargets
          .filter(target => target && target.state !== 'dead')
      }

      if (spirit.attributes && spirit.attributes.includes('sentinel')) {
        const nearEnemies = nearTargets
          .filter(target => target.instance !== spirit.instance &&
            target.instance !== spirit.owner
          )
          .filter(target => !spirit.coven ||
            (target.coven !== spirit.coven &&
              !spirit.allies.map(ally => ally.coven).includes(target.coven)
            )
          )
          .map(target => target.instance)

        const sentinelUpdate = []
        if (nearEnemies.length && spirit.sentinelList) {
          const newEnemies = nearEnemies
            .filter(instance => !spirit.sentinelList.includes(instance))

          if (newEnemies.length) {
            sentinelUpdate.push(
              informPlayers(
                [spirit.player],
                {
                  command: 'character_spirit_sentinel',
                  instance: spirit.instance,
                  spirit: spirit.id
                }
              )
            )
          }

          sentinelUpdate.push(
            updateHashField(spirit.instance, 'sentinelList', nearEnemies)
          )
          await Promise.all(sentinelUpdate)
        }
      }

      for (let i = 0; i < spirit.actionTree.length; i++) {
        const [targetCategory, type] = spirit.actionTree[i].target.split(':')
        const conditions = spirit.actionTree[i].conditions
        let target, summonerAttacker, summonerTarget

        switch (targetCategory) {
          case 'discover':
            if (
              Object.keys(spirit.carrying).reduce((accumulator, carried) => {
                return accumulator + carried.count
              }, 0) < spirit.maxCarry
            ) {
              resolve(['discover', spirit.actionTree[i].actions])
            }
            break
          case 'self':
            target = spirit
            resolve([spirit, spirit.actionTree[i].actions])
            break
          case 'all':
          case 'vulnerableAll':
            target = targetAll(spirit, nearTargets, conditions)
            break
          case 'attacker':
            if (spirit.lastAttackedBy) {
              target =
                spirit.lastAttackedBy.type === 'spirit' ?
                  targetSpirits(spirit, nearTargets, targetCategory, conditions) :
                  await targetCharacters(spirit, nearTargets, targetCategory, conditions)
            }
            break
          case 'previousTarget':
            if (spirit.previousTarget) {
              target =
                spirit.previousTarget.type === 'spirit' ?
                  targetSpirits(spirit, nearTargets, targetCategory, conditions) :
                  await targetCharacters(spirit, nearTargets, targetCategory, conditions)
            }
            break
          case 'collectible':
            if (!spirit.location) {
              if (
                Object.keys(spirit.carrying).reduce((accumulator, carried) => {
                  return accumulator + carried.count
                }, 0) < spirit.maxCarry
              ) {
                target = targetCollectibles(spirit, nearTargets, type)
              }
            }
            break
          case 'allies':
          case 'vulnerableAllies':
            target = targetAllies(spirit, nearTargets, targetCategory, conditions)
            break
          case 'enemies':
          case 'vulnerableEnemies':
            target = targetEnemies(spirit, nearTargets, targetCategory, conditions)
            break
          case 'spirits':
          case 'allySpirits':
          case 'enemySpirits':
            target = targetSpirits(spirit, nearTargets, targetCategory, conditions)
            break
          case 'summonerPortalAttacker':
            target = targetPortals(spirit, nearTargets, targetCategory)
            break
          case 'summonerAttacker':
            summonerAttacker =
              await getOneFromHash(spirit.owner, 'lastAttackedBy')
            if (summonerAttacker) {
              target = nearTargets
                .filter(target => target.instance === summonerAttacker.instance)[0]
              }
            break
          case 'summonerTarget':
            summonerTarget =
              await getOneFromHash(spirit.owner, 'previousTarget')
            if (summonerTarget) {
              target = nearTargets
                .filter(target => target.instance === summonerTarget.instance)[0]
              }
            break
          case 'vampires':
          case 'witches':
          case 'summoner':
            target = targetCharacters(spirit, nearTargets, targetCategory, conditions)
            break
          case 'deadAllies':
          case 'deadAll':
          case 'deadEnemies':
          case 'deadSummoner':
            target = await targetDead(spirit, nearTargets, targetCategory)
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
