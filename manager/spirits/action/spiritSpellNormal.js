const addCondition = require('./addCondition')
const determineDamage = require('./determineDamage')
const determineHeal = require('./determineHeal')

module.exports = (spirit, target, spell) => {
  let update = []
  let inform = []
  let total

  if (spell.range) {
    if (spell.range.includes('#')) {
      total = determineHeal(spirit, target, spell.range.slice(1))
    }
    else {
      total = determineDamage(spirit, target, spell.range)
    }
  }

  if (spell.condition) {
    [update, inform] = addCondition(spirit, target, spell)
  }

  return [total, update, inform]
}
