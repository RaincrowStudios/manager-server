module.exports = (xpMultipliers, category, first, spirit, aptitude = 0) => {
  let xp
  if (typeof xpMultipliers[category] === 'string') {
    if (xpMultipliers[category].includes('*')) {
      const parts = xpMultipliers[category].split('*')

      let mod
      if (isNaN(parts[0])) {
        mod = parseInt(spirit[parts[0]], 10)
      }
      else {
        mod = parseInt(parts[0], 10)
      }

      xp = mod * parseInt(spirit[parts[1]], 10)
    }
    else {
      xp = parseInt(spirit[xpMultipliers[category]], 10)
    }
  }
  else {
    xp = xpMultipliers[category]
  }

  xp += aptitude

  if (first) {
    xp = xp * xpMultipliers.firstMultiplier
  }

  return xp
}
