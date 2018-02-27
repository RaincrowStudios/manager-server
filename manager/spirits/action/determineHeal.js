module.exports = (spell) => {
  const range = spell.range.slice(1).split('-')
  const min = range[0]
  const max = range[1]

  let total = Math.floor(Math.random() * (max - min + 1)) + min

  return total
}
