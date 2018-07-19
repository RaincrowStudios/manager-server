const addCondition = require('./addCondition')
const determineDamage = require('./determineDamage')
const determineHeal = require('./determineHeal')

module.exports = (spirit, target, spell) => {
  return new Promise(async (resolve, reject) => {
    try {
      let total = 0
      let conditions = []

      if (spell.range) {
        if (spell.range.includes('#')) {
          total = determineHeal(spirit, target, spell.range.slice(1))
        }
        else {
          total = determineDamage(spirit, target, spell.range)
        }
      }

      if (spell.condition) {
        const condition = await addCondition(spirit, target, spell)
        conditions.push(condition)
      }

      resolve({total: total, conditions: conditions})
    }
    catch (err) {
      reject(err)
    }
  })
}
