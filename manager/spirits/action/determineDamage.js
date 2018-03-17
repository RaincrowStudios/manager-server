const determineCritical = require('./determineCritical')
const determineResist = require('./determineResist')

module.exports = (spirit, target, spell) => {
  let critical = false
  let resist = false
  const range = spell.range.split('-')
  const min = parseInt(range[0], 10)
  const max = parseInt(range[1], 10)

  let total = Math.floor(Math.random() * (max - min + 1)) + min

  total += spirit.power

  if (spirit.conditions && spirit.conditions.length > 0) {
    for (const condition of spirit.conditions) {
      if (condition && condition.power) {
        total += condition.power
      }
    }
  }

  if (determineCritical(spirit, target)) {
    total += Math.floor(Math.random() * (max - min + 1)) + min

    total += spirit.power

    if (spirit.conditions && spirit.conditions.length > 0) {
      for (const condition of spirit.conditions) {
        if (condition && condition.power) {
          total += condition.power
        }
      }
    }

    critical = true
  }

  if (determineResist(target)) {
    Math.round(total /= 2)
    resist = true
  }

  return { total: total * -1, critical, resist }
}
