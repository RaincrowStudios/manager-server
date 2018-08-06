module.exports = (spirit, target, baseCrit) => {
  let critChance = parseInt(baseCrit, 10)

  if (spirit.conditions && Object.values(spirit.conditions).length) {
    for (const condition of spirit.conditions) {
      if (condition.beCrit) {
        critChance += parseInt(condition.toCrit, 10)
      }
    }
  }

  if (target.conditions && Object.values(target.conditions).length) {
    for (const condition of spirit.conditions) {
      if (condition.beCrit) {
        critChance += parseInt(condition.beCrit, 10)
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
