const getOneFromList = require('../redis/getOneFromList')

module.exports = async (category, first, target, caster = {}, ingredients = []) => {
  const xpMultipliers = await getOneFromList('constants', 'xpMultipliers')

  let aptitude = caster.aptitude || 0

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

  xp = xp + Math.round(xp * (aptitude * 0.05))

  return xp
}