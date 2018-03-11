const getOneFromRedis = require('../../../utils/getOneFromRedis')
const determineHeal = require('./determineHeal')
const determineDamage = require('./determineDamage')
const addCondition = require('./addCondition')

function resolveSpiritSpell(instance, spirit, targetInstance, target, action) {
  return new Promise(async (resolve, reject) => {
    try {
      const spell = await getOneFromRedis('spells', action)
      let result = {}
      if (spell.special) {
        switch (spell.special) {
          case 'greaterHex':
            resolveGreaterHex()
            break
          default:
            break
        }
      }
      else {
        if (spell.range.includes('#')) {
          result = determineHeal(spell)
        }
        else {
          result = determineDamage(spirit, target, spell)
        }

        if (spell.condition) {
          if (spell.condition.maxStack <= 0) {
            result.condition = await addCondition(
              instance,
              spirit,
              targetInstance,
              target,
              action,
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
              result.condition = await addCondition(
                instance,
                spirit,
                targetInstance,
                target,
                spell
              )
            }
          }
        }
      }

      resolve(result)
    }
    catch (err) {
      reject(err)
    }
  })
}

module.exports = resolveSpiritSpell
