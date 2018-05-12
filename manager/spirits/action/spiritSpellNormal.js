const addCondition = require('./addCondition')
const determineHeal = require('./determineHeal')
const determineDamage = require('./determineDamage')

module.exports = (spirit, target, spell) => {
  return new Promise(async (resolve, reject) => {
    try {
      let result = {}
      if (spell.range.includes('#')) {
        result = determineHeal(spirit, target, spell)
      }
      else {
        result = determineDamage(spirit, target, spell)
      }

      if (spell.condition) {
        result.conditions = await addCondition(spirit, target, spell)
      }

      resolve(result)
    }
    catch (err) {
      reject(err)
    }
  })
}
