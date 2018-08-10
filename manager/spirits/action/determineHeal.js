module.exports = (spirit, target, range) => {
  const [min, max] = range.split('-')

  let total = Math.floor(
    Math.random() *
    (parseInt(max, 10) - parseInt(min, 10) + 1) + parseInt(min, 10)
  )

  if (spirit.conditions && Object.values(spirit.conditions).length) {
    for (const condition of Object.values(spirit.conditions)) {
      if (condition.healing) {
        total += parseInt(condition.healing, 10)
      }
    }
  }

  if (target.conditions && Object.values(target.conditions).length) {
    for (const condition of Object.values(target.conditions)) {
      if (condition.healing) {
        total += parseInt(condition.healing, 10)
      }
    }
  }

  return total
}
