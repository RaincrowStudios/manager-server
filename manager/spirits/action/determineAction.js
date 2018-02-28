module.exports = (spirit, index) => {
  const potentialActions = spirit.actions[index]
  if (potentialActions.length <= 1) {
    return potentialActions[0]
  }
}
