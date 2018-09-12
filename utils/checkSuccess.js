module.exports = (caster, target, spell = {}) => {
  let successChance = caster.type === 'witch' ? spell.succesRate : 100

  let focus = parseInt(caster.focus, 10)
  if (caster.conditions && Object.values(caster.conditions).length) {
    for (const condition of Object.values(caster.conditions)) {
      if (condition.focus) {
        focus += parseInt(condition.focus, 10)
      }
    }
  }
  successChance += (focus * 5)

  let ward = parseInt(target.ward, 10)
  if (target.conditions && Object.values(target.conditions).length) {
    for (const condition of Object.values(target.conditions)) {
      if (condition.ward) {
        ward =+ parseInt(condition.ward, 10)
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
