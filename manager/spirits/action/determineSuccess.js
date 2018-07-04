module.exports = (caster, target) => {
  let successChance = 100

  if (caster.conditions && caster.conditions.length) {
    for (const condition of caster.conditions) {
      if (condition.focus) {
        successChance += parseInt(condition.focus, 10) * 5
      }
    }
  }

  let ward
  if (target !== 'area' && target.conditions && target.conditions.length) {
    ward += parseInt(target.ward, 10) * 5
    for (const condition of target.conditions) {
      if (condition.ward) {
        ward =+ parseInt(condition.ward, 10) * 5
      }
    }
  }

  successChance -= ward * 5

  const roll = Math.floor((Math.random() * 100) + 1)
  if (roll <= successChance) {
    return true
  }
  else {
    return false
  }
}
