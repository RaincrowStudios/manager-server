const getOneFromHash = require('../../../../redis/getOneFromHash')
const spriritSpell = require('../spriritSpell')

module.exports = (caster, target, ingredients) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = {
        total: 0,
        critical: false,
        resist: false,
        conditions: []
      }
      for (let i = 0; i < 3; i++) {
        const spell = await getOneFromHash('list:spells', 'spell_hex')
        const intermediateResult =
          await spriritSpell(caster, target, spell, ingredients)

        result.total += intermediateResult.total
        if (intermediateResult.critical) {
          result.critical = true
        }
        if (intermediateResult.resist) {
          result.resist = true
        }
        result.conditions.push(intermediateResult.conditions)
      }
      resolve(result)
    }
    catch (err) {
      reject(err)
    }
  })
}
