module.exports = (duke, target) => {
  let actions, action
  const categories = duke.phases[duke.currentPhase].targetting[target.type]

  for (const category of categories) {
    if (category.relation === 'ally' && target.owner === duke.instance) {
      actions = category.actions
      break
    }

    if (category.relation === 'enemy' && target.owner !== duke.instance) {
      actions = category.actions
      break
    }

    if (category.state === target.state) {
      actions = category.actions
      break
    }

    if (
      category.status &&
      Object.values(target.condition)
        .filter(condition => condition.status === category.status).length
    ) {
      actions = category.actions
      break
    }

    if (
      category.conditions &&
      Object.values(target.condition).filter(condition => {
        if (category.conditions.includes(condition.id)) {
          return true
        }
        else {
          return false
        }
      })
    ) {
      actions = category.actions
      break
    }
  }

  if (actions.length === 1) {
    action = actions[0].id
  }
  else {
    const roll = Math.floor((Math.random() * 100) + 1)
    let weight = 0
    for (let i = 0; i < actions.length; i++) {
      weight += actions[i].weight
      if (roll < weight) {
        action = actions[i].id
      }
    }
  }

  return action
}
