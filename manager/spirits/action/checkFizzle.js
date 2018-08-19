module.exports = (caster, target, spell) => {
  if (spell === 'fizzle') {
    return true
  }

  if (caster.instance === target.instance) {
    target.type = 'self'
  }

  if (target !== 'area') {
    if (spell.targetTypes && !spell.targetTypes.includes(target.type)) {
      return true
    }
    else if (spell.targetStates && !spell.targetStates.includes(target.state)) {
      return true
    }
  }

  return false
}
