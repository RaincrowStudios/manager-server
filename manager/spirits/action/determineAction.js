module.exports = (actions) => {
  if (actions.length <= 1) {
    return actions[0].id
  }
  else {
    const roll = Math.floor((Math.random() * 100) + 1)
    let weight = 0
    for (let i = 0; i < actions.length; i++) {
      weight += actions[i].weight
      if (roll < weight) {
        return actions[i].id
      }
      else if (i === actions.length - 1) {
        return actions[i].id
      }
    }
    return actions[-1].id
  }
}
