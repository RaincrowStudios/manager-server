module.exports = (caster, target, spell) => {
  if (spell === 'fizzle') {
    return true
  }

  if (target !== 'area' && spell.restrictions) {
    for (const resriction of spell.restrictions) {
      if (resriction.type && resriction.type !== target.type) {
        return true
      }
      else if (resriction.status && resriction.status !== target.status) {
        return true
      }
    }
  }

  return false
}
