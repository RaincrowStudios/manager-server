module.exports = () => {
  spell.id = 'hex'
  spell.displayName = 'Hex'
  delete spell.special
  for (let i = 0; i < 3; i++) {
    const intermediateResult =
      resolveSpiritSpell(instance, spirit, spell, target)
    result.total += intermediateResult.total
    result.conditions.push(intermediateResult.conditions)
  }
}
