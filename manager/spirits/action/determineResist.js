module.exports = (target) => {
  let resistChance = target.resilience

  if (target.conditions.length !== 0) {
    for (const condition of conditions) {
      if (condition.resilience) {
        resistChance += condition.resilience
      }
    }
  }

  const roll = Math.floor((Math.random() * 100) + 1)
  if (roll <= resistChance) {
    return true
  }
  else {
    return false
  }
}
