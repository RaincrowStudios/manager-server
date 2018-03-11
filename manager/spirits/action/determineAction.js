module.exports = (potentialActions) => {
  if (potentialActions.length <= 1) {
    return potentialActions[0].id
  }
  else {
    const roll = Math.floor((Math.random() * 100) + 1)
    let weight = 0
    for (let i = 0; i < potentialActions.length; i++) {
      weight += potentialActions[i].weight
      if (roll < weight) {
        return potentialActions[i].id
      }
      else if (i === potentialActions.length - 1) {
        return potentialActions[i].id
      }
    }
    return potentialActions[-1].id
  }
}
