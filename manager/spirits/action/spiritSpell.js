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
const determineExperience = require('./determineExperience')
const resolveTargetDestruction = require('./resolveTargetDestruction')

module.exports = (spiritInstance, spirit, targetInstance, target, action) => {
  return new Promise(async (resolve, reject) => {
    try {
      const spiritExists = await checkKeyExistance(spiritInstance)
      const targetExists = await checkKeyExistance(targetInstance)

      if (spiritExists && targetExists) {
        const spell = await getOneFromHash('list:spells', action)
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
            targetInstance,
            result.total
          )

          if (!targetDead && spell.condition) {
            if (spell.condition.maxStack <= 0) {
              await addCondition(
                spiritInstance,
                spirit,
                targetInstance,
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
                  spiritInstance,
                  spirit,
                  targetInstance,
                  target,
                  spell
                )
              }
            }
          }
        }


        const xpGain = determineExperience()

        const award = 1//await addExperience(spirit.owner, xpGain)

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
              instance: spiritInstance,
              target: targetInstance,
              total: result.total,
            }
          ),
          informPlayers(
            [spirit.ownerPlayer],
            {
              command: 'player_spirit_action',
              action: spell.id,
              spirit: spiritInstance,
              displayName: spirit.displayName,
              target: target.displayName,
              targetType: target.type,
              total: result.total,
              xpGain: xpGain,
              xp: xp
            }
          ),
          addFieldsToHash(
            spiritInstance,
            ['previousTarget'],
            [{ targetInstance, type: 'spirit' }]
          ),
          addFieldsToHash(
            targetInstance,
            ['lastAttackedBy'],
            [{ spiritInstance, type: 'spirit' }]
          )
        ])

        if (!targetDead && target.type === 'witch') {
          await informPlayers(
            [target.player],
            {
              command: 'player_targeted_spell',
              attacker: spirit.displayName,
              owner: spirit.ownerDisplay,
              total: result.total,
              critical: result.critical,
              resist: result.resist,
              energy: targetCurrentEnergy
            }
          )
        }
        else if (targetDead) {
          resolveTargetDestruction(targetInstance, target, spiritInstance, spirit)
        }
      }
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
