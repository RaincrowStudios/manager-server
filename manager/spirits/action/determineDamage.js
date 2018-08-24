module.exports = (spirit, target, range) => {
  let total
  if (typeof range === 'number') {
    total = range
  }
  else {
    const [min, max] = range.split('-')

    total = Math.floor(
      Math.random() *
      (parseInt(max, 10) - parseInt(min, 10) + 1) + parseInt(min, 10)
    )
  }

  let power = parseInt(spirit.power, 10)
  let resilience = parseInt(target.resilience, 10)

  if (spirit.conditions && Object.values(spirit.conditions).length) {
    for (const condition of Object.values(spirit.conditions)) {
      if (condition.power) {
        power += parseInt(condition.power, 10)
      }
      if (condition.damage) {
        total += parseInt(condition.damage, 10)
      }
    }
  }

  if (target.conditions && Object.values(target.conditions).length) {
    for (const condition of Object.values(target.conditions)) {
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
