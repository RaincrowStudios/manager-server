const getFromRedis = require('../../../utils/getFromRedis')
const determineHeal = require('./determineHeal')
const determineDamage = require('./determineDamage')
const addCondition = require('./addCondition')

function resolveSpiritSpell(instance, spirit, action, target) {
  return new Promise(async (resolve, reject) => {
    try {
      const spell = await getFromRedis('spells', action)
      let result = {}
      if (spell.special) {
        switch (spell.special) {
          case 'greaterHex':
            spell.id = 'hex'
            spell.displayName = 'Hex'
            delete spell.special
            for (let i = 0; i < 3; i++) {
              const intermediateResult =
                resolveSpiritSpell(instance, spirit, spell, target)
              result.total += intermediateResult.total
              result.conditions.push(intermediateResult.conditions)
              result.conditionsHidden.push(intermediateResult.conditionsHidden)
            }
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
          result = determineDamage(spirit, spell, target)
        }
        if (spell.conditions.length > 0) {
          result.conditions = []
          result.conditionsHidden = []
          for (const condition of spell.conditions) {
            let stack = 0
            for (const condition of target.info.conditions) {
              if (condition.id === spell.id) {
                stack++
              }
            }
            for (const condition of target.info.conditionsHidden) {
              if (condition.id === spell.id) {
                stack++
              }
            }

            if (stack < condition.maxStack) {
              if (condition.hidden) {
                result.conditionsHidden.push(
                  addCondition(instance, spirit, action, spell, condition, target)
                )
              }
              else {
                result.conditions.push(
                  addCondition(instance, spirit, action, spell, condition, target)
                )
              }
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
