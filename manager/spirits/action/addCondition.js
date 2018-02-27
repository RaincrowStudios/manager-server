module.exports = (spell) => {
  let condition = {
    id: spell.id,
    spell: spell.displayName,
    school: spell.school,
    range: spell.range,
    duration: spell.duration,
    onExpiration: spell.onExpiration,
    onDispel: spell.onDispel,
    dispellable: spell.dispellable
  }
  return condition
}
