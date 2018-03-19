const addFieldsToHash = require('../../../redis/addFieldsToHash')
const addExperience = require('../../../redis/addExperience')
const adjustEnergy = require('../../../redis/adjustEnergy')
const checkKeyExistance = require('../../../redis/checkKeyExistance')
const getOneFromHash = require('../../../redis/getOneFromHash')
const informNearbyPlayers = require('../../../utils/informNearbyPlayers')
const informPlayers = require('../../../utils/informPlayers')
const addCondition = require('./addCondition')
const determineHeal = require('./determineHeal')
const determineDamage = require('./determineDamage')
const determineXp = require('./determineXp')
const resolveTargetDestruction = require('./resolveTargetDestruction')

module.exports = (
  instance,
  spirit,
  targetCategory,
  targetInstance,
  target,
  action
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const spiritExists = await checkKeyExistance('spirits', instance)
      const targetExists = await checkKeyExistance(targetCategory, targetInstance)

      if (spiritExists && targetExists) {

        const spell = await getOneFromHash('spells', 'all', action)
        let result = {}
        let targetCurrentEnergy, targetDead
        if (spell.special) {
          //spiritSpecialSpell()
        }
        else {
          if (spell.range.includes('#')) {
            result = determineHeal(spirit, target, spell)
          }
          else {
            result = determineDamage(spirit, target, spell)
          }

          [targetCurrentEnergy, targetDead] = await adjustEnergy(
            targetCategory,
            targetInstance,
            result.total
          )

          if (!targetDead && spell.condition) {
            if (spell.condition.maxStack <= 0) {
              await addCondition(
                instance,
                spirit,
                targetInstance,
                targetCategory,
                target,
                spell
              )
            }
            else {
              let stack = 0
              for (const condition of target.conditions) {
                if (condition && condition.id === action) {
                  stack++
                }
              }
              if (stack < spell.condition.maxStack) {
                await addCondition(
                  instance,
                  spirit,
                  targetInstance,
                  targetCategory,
                  target,
                  spell
                )
              }
            }
          }
        }


        const xpGain = determineXp()

        const award = 1//await addExperience('characters', spirit.owner, xpGain)

        let xp
        if (typeof award === 'number') {
          xp = award
        }

        await Promise.all([
          informNearbyPlayers(
            spirit.latitude,
            spirit.longitude,
            {
              command: 'map_spirit_action',
              action: spell.id,
              instance: instance,
              target: targetInstance,
              total: result.total,
            }
          ),
          informPlayers(
            [spirit.ownerPlayer],
            {
              command: 'player_spirit_action',
              action: spell.id,
              instance: instance,
              displayName: spirit.displayName,
              target: target.type === 'spirit' ? target.displayName : targetInstance,
              targetType: target.type,
              total: result.total,
              xpGain: xpGain,
              xp: xp
            }
          ),
          addFieldsToHash(
            'spirits',
            instance,
            ['previousTarget'],
            [{ targetInstance, type: 'spirit' }]
          ),
          addFieldsToHash(
            targetCategory,
            targetInstance,
            ['lastAttackedBy'],
            [{ instance, type: 'spirit' }]
          )
        ])

        if (!targetDead && targetCategory === 'characters') {
          await informPlayers(
            [target.player],
            {
              command: 'player_targeted_spell',
              attacker: spirit.displayName,
              owner: spirit.owner,
              total: result.total,
              critical: result.critical,
              resist: result.resist,
              energy: targetCurrentEnergy
            }
          )
        }
        else if (targetDead) {
          resolveTargetDestruction(targetInstance, target, instance)
        }

        console.log({
          event: 'spirit_action',
          action: spell.id,
          instance: instance,
          target: targetInstance,
          damage: result.total,
          critical: result.critical,
          resist: result.resist,
          targetEnergy: targetCurrentEnergy
        })
      }
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
