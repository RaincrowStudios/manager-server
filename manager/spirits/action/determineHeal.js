module.exports = (spell) => {
  let total
  if (spell.range.includes('-')) {
    const range = spell.range.slice(1).split('-')
    const min = range[0]
    const max = range[1]
    total = Math.floor(Math.random() * (max - min + 1)) + min
  }
  else {
    total = parseInt(spell.range.slice(1))
  }
  return total
}
