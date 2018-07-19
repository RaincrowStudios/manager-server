module.exports = (spirit, target, range) => {
  const [min, max] = range.split('-')

  let total = Math.floor(
    Math.random() *
    (parseInt(max, 10) - parseInt(min, 10) + 1) + parseInt(min, 10)
  )

  if (spirit.conditions && spirit.conditions.length > 0) {
    for (const condition of spirit.conditions) {
      if (condition && condition.healing) {
        total += parseInt(condition.healing, 10)
      }
    }
  }

  if (target.conditions && target.conditions.length > 0) {
    for (const condition of target.conditions) {
      if (condition && condition.healing) {
        total += parseInt(condition.healing, 10)
      }
    }
  }

  return total
}
