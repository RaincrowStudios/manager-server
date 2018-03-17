module.exports = (spirit, target, spell) => {
  const range = spell.range.slice(1).split('-')
  const min = parseInt(range[0], 10)
  const max = parseInt(range[1], 10)

  let total = Math.floor(Math.random() * (max - min + 1)) + min

  if (spirit.conditions && spirit.conditions.length > 0) {
    for (const condition of spirit.conditions) {
      if (condition && condition.healing) {
        total += condition.healing
      }
    }
  }

  if (target.conditions && target.conditions.length > 0) {
    for (const condition of target.conditions) {
      if (condition && condition.healing) {
        total += condition.healing
      }
    }
  }

  return { total: total }
}
