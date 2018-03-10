module.exports = (spirit, index) => {
  console.log(index)
  const potentialActions = spirit.actions[index]
  if (potentialActions.length <= 1) {
    return potentialActions[0]
  }
  else {
    const roll = Math.floor((Math.random() * 100) + 1)
    let weight = 0
    for (let i = 0; i < potentialActions.length; i++) {
      weight += potentialActions[i][1]
      if (roll < weight) {
        return potentialActions[i][0]
      }
      else if (i === potentialActions.length - 1) {
        return potentialActions[i][0]
      }
    }
    return potentialActions[-1][0]
  }
}
