module.exports = (character, spell) => {

  character.conditions.push({
    range: spell.range,
    healing: spell.healing,
    onExpiraiton: spell.onExpiration,
    onDispel: spell.onDispel,
    beCrit: spell.beCrit,
    duration: spell.duration,
    dispellable: spell.dispellable
  })
}
