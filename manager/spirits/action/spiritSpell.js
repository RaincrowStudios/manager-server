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
          spiritSpecialSpell()
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

        const xp = 1//determineExperience()

        const levelUp = 1//await addExperience(spirit.owner, xp)

        const inform = [
          informNearbyPlayers(
            spirit.latitude,
            spirit.longitude,
            {
              command: 'map_spirit_action',
              instance: spirit.instance,
              target: target.instance,
              action: spell.displayName
            }
          ),
          informPlayers(
            [spirit.player],
            {
              command: 'character_spirit_action',
              spirit: spirit.displayName,
              action: spell.displayName,
              target: target.displayName,
              type: target.type,
              xp: xp
            }
          ),
          addFieldsToHash(
            spirit.instance,
            ['previousTarget'],
            [{ instance: target.instance, type: target.type }]
          ),
          addFieldsToHash(
            target.instance,
            ['lastAttackedBy'],
            [{ instance: spirit.instance, type: 'spirit' }]
          )
        ]

        if (target.type === 'witch') {
          inform.push(
            informPlayers(
              [target.player],
              {
                command: 'character_spell_hit',
                caster: spirit.displayName,
                type: spirit.type,
                degree: spirit.degree,
                spell: spell.displayName,
                school: spell.school,
                result: result,
              }
            )
          )
        }

        await Promise.all(inform)

        if (targetCurrentEnergy <= 0) {
          resolveTargetDestruction(spirit, target, spell)
        }
      }
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
