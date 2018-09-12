module.exports = (spell, damage = 0) => {
  let total
  const parts = spell.self.split('*')
  const mod = parts[0]
  const subparts = parts[1]
  if (subparts.includes('#')) {
    if (subparts.includes('-')) {
      const range = subparts.slice(1).split('-')
      const min = parseInt(range[0], 10)
      const max = parseInt(range[1], 10)

      total = Math.floor(Math.random() * (max - min + 1)) + min
    }
    else if (subparts.includes('damage')) {
      total = Math.abs(damage)
    }
    else {
      total = parseInt(subparts.slice(1), 10)
    }
  }
  else {
    if (subparts.includes('-')) {
      const range = subparts.split('-')
      const min = parseInt(range[0], 10)
      const max = parseInt(range[1], 10)

      total = Math.floor(Math.random() * (max - min + 1)) + min
    }
    else {
      total = parseInt(spell.self, 10)
    }
    total = total * -1
  }

  total = Math.round(total * parseFloat(mod, 10))

  return total
}
