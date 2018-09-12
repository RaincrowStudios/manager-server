module.exports = (caster, spell) => {
  let cost = 0

  if (
    Object.values(caster.conditions)
      .filter(condition => condition.status === 'freecasting').length
  ) {
    cost = 0
  }
  else if (typeof spell.cost === 'number' && !isNaN(spell.cost)) {
    cost = spell.cost
  }
  else if (spell.cost.includes('*')) {
    const parts = spell.cost.split('*')
    const mod = parseFloat(parts[0], 10)
    const subparts = parts[1].split(':')

    let property
    if (subparts[0] === 'caster') {
      property = caster
    }

    cost = mod * parseInt(property[subparts[1]], 10)
  }
  else if (spell.cost.includes('-')) {
    const [min, max] = spell.cost.split('-')

    cost = Math.floor(
      Math.random() * (parseInt(max, 10) - parseInt(min, 10) + 1)
    ) + parseInt(min, 10)
  }

  return cost * -1
}
