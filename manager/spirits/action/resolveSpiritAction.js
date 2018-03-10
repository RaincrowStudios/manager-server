const constants = require('../../../constants')
const getInfoFromRedis = require('../../../utils/getInfoFromRedis')
const getNearbyFromGeohashByPoint = require('../../../utils/getNearbyFromGeohashByPoint')
const informPlayers = require('../../../utils/informPlayers')
const addToRedis = require('../../../utils/addToRedis')
const determineTargets = require('./determineTargets')
const determineAction = require('./determineAction')
const resolveBasicAttack = require('./resolveBasicAttack')
const resolveSpiritSpell = require('./resolveSpiritSpell')
const resolveCharacterDeath = require('./resolveCharacterDeath')
const spiritDeath = require('../spiritDeath')
const portalDestroy = require('../../portals/portalDestroy')

module.exports = (instance, spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      let targetInstance, target, index
      [targetInstance, target, index] = await determineTargets(instance, spirit)

      if (target) {
        const action = determineAction(spirit, index)

        let result
        switch (action) {
          case 'attack':
            result = await resolveBasicAttack(spirit, target)
            break
          case 'collect':
            break
          default:
            result = await resolveSpiritSpell(
              instance,
              spirit,
              targetInstance,
              target,
              action
            )
            break
        }

        spirit.previousTarget = targetInstance
        target.energy += result.total

        if (result.total < 0) {
          target.lastAttackedBy = { instance, type: 'spirit' }
        }
        else if (result.total > 0) {
          target.lastHealedBy = { instance, type: 'spirit' }
        }

        if (target.energy <= 0) {
          target.dead = true
        }

        const charactersNearLocation =
          await getNearbyFromGeohashByPoint(
            'Characters',
            spirit.latitude,
            spirit.longitude,
            constants.maxRadius
          )

        const playersToInform = charactersNearLocation.length !== 0 ?
          await Promise.all(
            charactersNearLocation.map(async (character) => {
              const characterInfo = await getInfoFromRedis(character[0])
              return characterInfo.owner
            })
          ) : []

        console.log({
          event: 'spirit_action',
          spirit: instance,
          owner: spirit.ownerPlayer,
          target: targetInstance,
          action,
          total: result.total,
          dead: target.dead
        })

        if (
          (target.type === 'lesserSpirit' || target.type === 'greaterSpirit') &&
          target.dead
        ) {
          await Promise.all([
            informPlayers(
              playersToInform,
              {
                command: 'map_spirit_action',
                instance: instance,
                target: targetInstance,
                total: result.total,
                dead: target.dead
              }
            ),
            informPlayers(
              [spirit.ownerPlayer],
              {
                command: 'player_spirit_action',
                instance: instance,
                displayName: spirit.displayName,
                target: (target.type === 'lesserSpirit' ||
                target.type === 'greaterSpirit') ?
                  target.displayName : targetInstance,
                xp: 'xp_gain'
              }
            ),
            addToRedis(instance, spirit),
            spiritDeath(targetInstance, target, instance)
          ])
        }
        else if (
          (target.type === 'lesserPortal' || target.type === 'greaterPortal') &&
          target.dead
        ) {
          await Promise.all([
            informPlayers(
              playersToInform,
              {
                command: 'map_spirit_action',
                instance: instance,
                target: targetInstance,
                total: result.total,
                destroyed: target.dead
              }
            ),
            informPlayers(
              [spirit.ownerPlayer],
              {
                command: 'player_spirit_action',
                instance: instance,
                displayName: spirit.displayName,
                target: (target.type === 'lesserSpirit' ||
                target.type === 'greaterSpirit') ?
                  target.displayName : targetInstance,
                xp: 'xp_gain'
              }
            ),
            addToRedis(instance, spirit),
            portalDestroy(targetInstance, target, instance)
          ])
        }
        else if (target.dead) {
          await Promise.all([
            informPlayers(
              playersToInform,
              {
                command: 'map_spirit_action',
                instance: instance,
                target: targetInstance,
                total: result.total,
                destroyed: target.dead
              }
            ),
            informPlayers(
              [spirit.ownerPlayer],
              {
                command: 'player_spirit_action',
                instance: instance,
                displayName: spirit.displayName,
                target: (target.type === 'lesserSpirit' ||
                target.type === 'greaterSpirit') ?
                  target.displayName : targetInstance,
                xp: 'xp_gain'
              }
            ),
            addToRedis(instance, spirit),
            resolveCharacterDeath()
          ])
        }
        else {
          await Promise.all([
            informPlayers(
              playersToInform,
              {
                command: 'map_spirit_action',
                instance: instance,
                target: targetInstance,
                total: result.total
              }
            ),
            informPlayers(
              [spirit.ownerPlayer],
              {
                command: 'player_spirit_action',
                instance: instance,
                displayName: spirit.displayName,
                target: (target.type === 'lesserSpirit' ||
                target.type === 'greaterSpirit') ?
                  target.displayName : targetInstance,
                xp: 'xp_gain'
              }
            ),
            addToRedis(instance, spirit),
            addToRedis(targetInstance, target)
          ])
        }
      }
      else {
        await addToRedis(instance, spirit)
      }
      resolve(true)
    }
      catch (err) {
        reject(err)
      }
    })
  }
