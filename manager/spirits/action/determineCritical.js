module.exports = (spirit, target) => {
  let critChance = spirit.critical

  if (spirit.conditions && spirit.conditions.length !== 0) {
    for (const condition of spirit.conditions) {
      if (condition && condition.beCrit) {
        critChance += condition.toCrit
      }
    }
  }

  if (target.conditions && target.conditions.length !== 0) {
    for (const condition of spirit.conditions) {
      if (condition && condition.beCrit) {
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
