module.exports = (target) => {
  let resistChance = target.resilience

  if (target.conditions && target.conditions.length) {
    for (const condition of target.conditions) {
      if (condition && condition.resilience) {
        resistChance += condition.resilience
      }
    }
  }

  const roll = Math.floor((Math.random() * 100) + 1)
  resistChance = 50
  if (roll <= resistChance) {
    return true
  }
  else {
    return false
  }
}
