module.exports = (caster, target, range, ingredients) => {
  let total = 0
  if (range.includes('*')) {
    const parts = range.split('*')
    const mod = parseFloat(parts[0], 10)
    const subparts = parts[1].split(':')

    let property
    if (subparts[0] === 'caster') {
      property = caster
    }
    else if (subparts[0] === 'target') {
      property = target
    }

    total = mod * parseInt(property[subparts[1]], 10)
  }
  else if (range.includes('-')) {
    const [min, max] = range.split('-')

    total = Math.floor(
      Math.random() *
      (parseInt(max, 10) - parseInt(min, 10) + 1) + parseInt(min, 10)
    )
  }
  else {
    total = parseInt(range, 10)
  }

  if (caster.conditions && Object.values(caster.conditions).length) {
    for (const condition of Object.values(caster.conditions)) {
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

  for (const ingredient of ingredients) {
    if (ingredient && ingredient.spell && ingredient.spell.healing) {
      total += (ingredient.spell.healing * ingredient.count)
    }
  }

  if (total < 0) {
    total = 0
  }

  return total
}
