const getOneFromList = require('../../../redis/getOneFromList')
const addCondition = require('./addCondition')
const calculateDamage = require('./calculateDamage')
const determineHeal = require('./determineHeal')

module.exports = async (duke, target, action) => {
  let update = []
  let inform = []
  let total = 0

  if (action === 'attack') {
    total = calculateDamage(duke, target, action)
  }
  else {
    const spell = await getOneFromList('spells', action)

    if (spell.range) {
      if (spell.range.includes('#')) {
        total = determineHeal(duke, target, spell.range.slice(1))
      }
      else {
        total = calculateDamage(duke, target, spell.range)
      }
    }
    
    if (spell.condition) {
      [update, inform] = addCondition(duke, target, spell)
    }
  }
  return [total, update, inform]
}
