const constants = require('../../../constants/constants')
const getFromRedis = require('../../../utils/getFromRedis')
const getNearbyFromGeohashByPoint = require('../../../utils/getNearbyFromGeohashByPoint')
const informPlayers = require('../../../utils/informPlayers')
const updateRedis = require('../../../utils/updateRedis')
const determineTargets = require('./determineTargets')
const determineAction = require('./determineAction')
const resolveBasicAttack = require('./resolveBasicAttack')
const resolveSpiritSpell = require('./resolveSpiritSpell')
const spiritDeath = require('../spiritDeath')

module.exports = (instance, spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      let target, index
      [target, index] = await determineTargets(instance, spirit.info)

      if (target) {
        const action = determineAction(spirit.info, index)

        const result =
          action === 'attack' ?
            await resolveBasicAttack(spirit.info, target.info) :
            await resolveSpiritSpell(instance, spirit.info, action, target)

        spirit.info.previousTarget = target.instance
        target.info.energy += result.total

        if (result.conditions && result.conditionsHidden) {
          target.info.conditions.push(...result.conditions)
          target.info.conditionsHidden.push(...result.conditionsHidden)
          target.mapSelection.conditions.push(...result.conditions)
        }

        target.mapSelection.energy += result.total
        if (result.total < 0) {
          target.info.lastAttackBy = { instance, type: 'spirit' }
        }
        else {
          target.info.lastHealedBy = { instance, type: 'spirit' }
        }

        let dead = false
        if (target.info.energy <= 0) {
          dead = true
        }
        console.log({target: target.instance, energy: target.info.energy})
        const charactersNearLocation =
          await getNearbyFromGeohashByPoint(
            'Characters',
            spirit.info.latitude,
            spirit.info.longitude,
            constants.radiusVisual
          )

        const playersToInform = charactersNearLocation.length !== 0 ?
          await Promise.all(
            charactersNearLocation.map(async (character) => {
              const characterInfo = await getFromRedis(character[0], 'info')
              return characterInfo.owner
            })
          ) : []

        /*console.log({
          event: 'spirit_action',
          spirit: instance,
          owner: spirit.info.ownerPlayer,
          target: target.instance,
          targetOwner: target.info.ownerPlayer,
          action,
          result,
          dead
        })*/

        if (
          (target.info.type === 'lesserSpirit' ||
          target.info.type === 'greaterSpirit') &&
          dead
        ) {
          console.log('here')
          await Promise.all([
            informPlayers(
              playersToInform,
              {
                command: 'map_spirit_action',
                instance: instance,
                target: target.instance,
                total: result.total,
                dead: dead
              }
            ),
            informPlayers(
              [spirit.info.ownerPlayer],
              {
                command: 'player_spirit_action',
                instance: instance,
                displayName: spirit.displayName,
                target: (target.info.type === 'lesserSpirit' ||
                target.info.type === 'greaterSpirit') ?
                  target.info.displayName : target.instance,
                xp: 'xp_gain'
              }
            ),
            updateRedis(instance, ['info'], [spirit.info]),
            spiritDeath(target.instance, target.info, instance)
          ])
        }
        else {
          await Promise.all([
            informPlayers(
              playersToInform,
              {
                command: 'map_spirit_action',
                instance: instance,
                target: target.instance,
                total: result.total,
                dead: dead
              }
            ),
            informPlayers(
              [spirit.info.ownerPlayer],
              {
                command: 'player_spirit_action',
                instance: instance,
                displayName: spirit.displayName,
                target: (target.info.type === 'lesserSpirit' ||
                target.info.type === 'greaterSpirit') ?
                  target.info.displayName : target.instance,
                xp: 'xp_gain'
              }
            ),
            updateRedis(instance, ['info'], [spirit.info]),
            updateRedis(
              target.instance,
              ['info', 'mapSelection', 'mapToken'],
              [target.info, target.mapSelection, target.mapToken]
            )
          ])
        }
      }
      else {
        await updateRedis(instance, ['info'], [spirit.info])
      }
      resolve(true)
    }
      catch (err) {
        reject(err)
      }
    })
  }
