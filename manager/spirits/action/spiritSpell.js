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

module.exports = (spirit, target, action) => {
  return new Promise(async (resolve, reject) => {
    try {
      const spiritExists = await checkKeyExistance(spirit.instance)
      const targetExists = await checkKeyExistance(target.instance)

      if (spiritExists && targetExists) {
        const spell = await getOneFromHash('list:spells', action)
        let result = {}
        let targetCurrentEnergy
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

          targetCurrentEnergy =
            await adjustEnergy(target.instance, result.total)

          if (targetCurrentEnergy > 0 && spell.condition) {
            if (spell.condition.maxStack <= 0) {
              await addCondition(spirit, target, spell)
            }
            else {
              let stack = 0
              for (const condition of target.conditions) {
                if (condition && condition.id === action) {
                  stack++
                }
              }
              if (stack < spell.condition.maxStack) {
                await addCondition(spirit, target, spell)
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
              instance: spirit.instance,
              target: target.instance,
              total: result.total,
            }
          ),
          informPlayers(
            [target.player],
            {
              command: 'player_character_spell',
              action: 'attack',
              caster: spirit.instance,
              displayName: spirit.displayName,
              total: result.total,
            }
          ),
          informPlayers(
            [spirit.player],
            {
              command: 'player_spirit_action',
              action: spell.id,
              spirit: spirit.instance,
              displayName: spirit.displayName,
              target: target.displayName,
              type: target.type,
              total: result.total,
              xpGain: xpGain,
              xp: xp
            }
          ),
          addFieldsToHash(
            spirit.instance,
            ['previousTarget'],
            [{ instance: target.instance, type: 'spirit' }]
          ),
          addFieldsToHash(
            target.instance,
            ['lastAttackedBy'],
            [{ instance: spirit.instance, type: 'spirit' }]
          )
        ])

        if (targetCurrentEnergy > 0 && target.type === 'witch') {
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
        else if (targetCurrentEnergy <= 0) {
          resolveTargetDestruction(target, spirit)
        }
      }
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
