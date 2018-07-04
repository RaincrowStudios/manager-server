module.exports = (spirit, target, spell) => {
  const range = spell.range.split('-')
  const min = parseInt(range[0], 10)
  const max = parseInt(range[1], 10)

  let total = Math.floor(Math.random() * (max - min + 1)) + min

  let power = parseInt(spirit.power, 10)
  let resilience = parseInt(target.resilience, 10)

  if (spirit.conditions && spirit.conditions.length) {
    for (const condition of spirit.conditions) {
      if (condition.power) {
        power += parseInt(condition.power, 10)
      }
    }
  }

  if (target.conditions && target.conditions.length) {
    for (const condition of target.conditions) {
      if (condition.resilience) {
        resilience += parseInt(condition.resilience, 10)
      }
    }
  }

  total += Math.round((total * (power * 0.05)))
  total -= Math.round((total * (resilience * 0.05)))

  if (total < 0) {
    total = 0
  }

  total *= -1

  return total
}
