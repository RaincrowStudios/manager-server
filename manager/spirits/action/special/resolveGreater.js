const getOneFromList = require('../../../../redis/getOneFromList')
const spiritSpellNormal = require('../spiritSpellNormal')

module.exports = (caster, target, spell, ingredients) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = { total: 0, conditions: [] }
      
      for (let i = 0; i < 3; i++) {
        const newSpell = await getOneFromList('spells', spell.greater)
        const intermediateResult =
          await spiritSpellNormal(caster, target, newSpell, ingredients)

        result.total += intermediateResult.total
        result.conditions.push(...intermediateResult.conditions)
      }
      resolve(result)
    }
    catch (err) {
      reject(err)
    }
  })
}
