module.exports = (spirit, target) => {
  let critChance = spirit.critical

  if (spirit.conditions.length !== 0) {
    for (const condition of conditions) {
      if (condition.beCrit) {
        critChance += condition.toCrit
      }
    }
  }

  if (target.conditions.length !== 0) {
    for (const condition of conditions) {
      if (condition.beCrit) {
        critChance += condition.beCrit
      }
    }
  }

  const roll = Math.floor((Math.random() * 100) + 1)
  if (roll <= critChance) {
    return true
  }
  else {
    return false
  }
}
