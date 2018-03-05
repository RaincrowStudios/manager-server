module.exports = (spell) => {
  const range = spell.range.slice(1).split('-')
  const min = parseInt(range[0], 10)
  const max = parseInt(range[1], 10)

  const total = Math.floor(Math.random() * (max - min + 1)) + min

  return { total: total }
}
