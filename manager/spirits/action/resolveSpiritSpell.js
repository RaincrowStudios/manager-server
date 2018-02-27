const checkForSpecialCondition = require('./checkForSpecialCondition')
const determineHeal = require('./resolveNormalSpell/determineHeal')
const determineDamage = require('./resolveNormalSpell/determineDamage')
const addCondition = require('./resolveNormalSpell/addCondition')

module.exports = (spirit, spell, target) => {
  return new Promise((resolve, reject) => {
    try {
      let spellSuccess = {}
      if (spell.range.includes('*')) {
        const result = determineHeal(
          spell,
          caster,
          target
        )
        spellSuccess = {
          characterName: target.characterName,
          alignment: target.alignment,
          energy: target.energy + result.total,
          healing: result.total
        }
        if (spell.duration > 0) {
          spellSuccess.condition = addCondition(spell, target)
        }
      }
      else {
        const result = determineDamage(spirit, spell, target)
        spellSuccess = {
          characterName: target.characterName,
          alignment: target.alignment,
          energy: target.energy - result.total,
          damage: result.total,
          critical: result.critical,
          resist: result.resist
        }

        if (spell.duration > 0) {
          spellSuccess.condition = addCondition(spell, ingredients)
        }
      }
      resolve(spellSuccess)
    }
    catch (err) {
      reject(err)
    }
  })
}
