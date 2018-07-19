module.exports = (spirit, target) => {
  let successChance = 100

  let focus = parseInt(spirit.focus, 10)
  if (spirit.conditions && spirit.conditions.length) {
    for (const condition of spirit.conditions) {
      if (condition.focus) {
        focus += parseInt(condition.focus, 10)
      }
    }
  }
  successChance += (focus * 5)

  let ward = 0
  if (target !== 'area') {
    ward += parseInt(target.ward, 10)
    if (target !== 'area' && target.conditions && target.conditions.length) {
      for (const condition of target.conditions) {
        if (condition.ward) {
          ward =+ parseInt(condition.ward, 10)
        }
      }
    }
  }
  successChance -= (ward * 5)

  const roll = Math.floor((Math.random() * 100) + 1)

  if (roll <= successChance) {
    return true
  }
  else {
    return false
  }
}
