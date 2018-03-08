const determineCritical = require('./determineCritical')
const determineResist = require('./determineResist')

module.exports = (spirit, target) => {
  const range = spirit.attack.split('-')
  const min = parseInt(range[0], 10)
  const max = parseInt(range[1], 10)
  let critical = false
  let resist = false

  let total = Math.floor(Math.random() * (max - min + 1)) + min

  if (determineCritical(spirit, target)) {
    total += Math.floor(Math.random() * (max - min + 1)) + min

    if (spirit.conditions && spirit.conditions.length !== 0) {
      for (const condition of spirit.conditions.conditions) {
        if (condition.beCrit) {
          total += condition.power
        }
      }
    }
    critical = true
  }

  if (determineResist(target)) {
    total /= 2
    resist = true
  }

  return { total: total * -1, critical, resist }
}
