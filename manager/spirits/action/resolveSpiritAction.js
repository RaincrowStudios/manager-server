const constants = require('../../../constants')
const getInfoFromRedis = require('../../../utils/getInfoFromRedis')
const getNearbyFromGeohashByPoint = require('../../../utils/getNearbyFromGeohashByPoint')
const informPlayers = require('../../../utils/informPlayers')
const addToRedis = require('../../../utils/addToRedis')
const determineTargets = require('./determineTargets')
const determineAction = require('./determineAction')
const resolveBasicAttack = require('./resolveBasicAttack')
const resolveSpiritCollect = require('./resolveSpiritCollect')
const resolveSpiritSpell = require('./resolveSpiritSpell')
const resolveTargetDestruction = require('./resolveTargetDestruction')

module.exports = (instance, spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      let targetInstance, target, actions
      [targetInstance, target, actions] =
        await determineTargets(instance, spirit)

      if (target) {
        const action = determineAction(actions)

        let result
        switch (action) {
          case 'attack':
            result = await resolveBasicAttack(spirit, target)
            break
          case 'collect':
            result = await resolveSpiritCollect(spirit, target)
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
        if (result.condition) {
          target.conditions.push(result.condition)
        }

        if (result.total < 0) {
          target.lastAttackedBy = { instance, type: 'spirit' }
        }
        else if (result.total > 0) {
          target.lastHealedBy = { instance, type: 'spirit' }
        }

        if (target.energy <= 0) {
          target.dead = true
        }

        const nearCharacters =
          await getNearbyFromGeohashByPoint(
            'Characters',
            spirit.latitude,
            spirit.longitude,
            constants.maxRadius
          )

        const nearCharactersInfo =
          await Promise.all(
            nearCharacters.map(character => getInfoFromRedis(character[0]))
          )

        const playersToInform = nearCharactersInfo.length > 0 ?
          nearCharactersInfo.map(character => character.owner) : []

        console.log({
          event: 'spirit_action',
          spirit: instance,
          owner: spirit.ownerPlayer,
          target: targetInstance,
          action: action,
          total: result.total,
          dead: target.dead
        })

        if (target.dead) {
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
                target: target.type === 'spirit' || target.type === 'portal' ?
                  target.displayName : targetInstance,
                xp: 'xp_gain'
              }
            ),
            addToRedis(instance, spirit),
            resolveTargetDestruction(targetInstance, target, instance)
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
                target: target.type === 'spirit' || target.type === 'portal' ?
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
