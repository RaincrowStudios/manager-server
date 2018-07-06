module.exports = (
  xpMultipliers,
  category,
  first,
  target,
  caster = {},
  ingredients = []
) => {
  let aptitude = caster.aptitude ? caster.aptitude : 0

  let xp = target[xpMultipliers[category].base] * xpMultipliers[category].multiplier

  if (first) {
    xp *= xpMultipliers.firstMultiplier
  }

  for (const ingredient of ingredients) {
    if (ingredient.spell && ingredient.spell.aptitude) {
      aptitude += (ingredient.spell.aptitude * ingredient.count)
    }
    xp += (ingredient.rarity * ingredient.count)
  }

  xp *= (aptitude * 0.05)

  return xp
}
