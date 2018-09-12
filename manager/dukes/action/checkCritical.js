module.exports = (baseCrit, caster, target, ingredients) => {
  let critChance = baseCrit

  if (caster.conditions && Object.values(caster.conditions).length) {
    for (const condition of Object.values(caster.conditions)) {
      if (condition.toCrit) {
        critChance += parseInt(condition.toCrit, 10)
      }
    }
  }

  if (target.conditions && Object.values(target.conditions).length) {
    for (const condition of Object.values(caster.conditions)) {
      if (condition.beCrit) {
        critChance += parseInt(condition.beCrit, 10)
      }
    }
  }

  for (const ingredient of ingredients) {
    if (ingredient.spell && ingredient.spell.critRate) {
      critChance +=
        (parseInt(ingredient.spell.critRate, 10) *
        parseInt(ingredient.count, 10))
    }
  }

  critChance = critChance > 50 ? 50 : critChance

  const roll = Math.floor((Math.random() * 100) + 1)
  if (roll <= critChance) {
    return true
  }
  else {
    return false
  }
}
