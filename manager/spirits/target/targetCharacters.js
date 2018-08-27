module.exports = (spirit, nearTargets, targetCategory, targetingConditions) => {
  let nearCharacters = nearTargets
    .filter(target => target.type === 'witch' || target.type === 'vampire')

  if (targetingConditions && targetingConditions.length) {
    nearCharacters = nearCharacters
      .filter(target => {
        for (const targetingCondition of targetingConditions) {
          if (
            target.conditions &&
            Object.values(target.conditions)
              .filter(condition => condition.id === targetingCondition).length
          ) {
            return true
          }
        }
        return false
      })
  }

  let target
  if (nearCharacters.length) {
    if (targetCategory === 'allyWitch') {
      const nearAllies = nearCharacters
        .filter(target => target.coven === spirit.coven)

      if (nearAllies.length) {
        target = nearAllies[Math.floor(Math.random() * nearAllies.length)]
      }
    }
    else if (targetCategory === 'enemyWitch') {
      const nearEnemies = nearCharacters
        .filter(target => target.coven !== spirit.coven)

      if (nearEnemies.length) {
        target = nearEnemies[Math.floor(Math.random() * nearEnemies.length)]
      }
    }
    else if (targetCategory === 'attacker') {
      target = nearCharacters
        .filter(target => target.instance === spirit.lastAttackedBy.instance)[0]

    }
    else if (targetCategory === 'previousTarget') {
      target = nearCharacters
        .filter(target => target.instance === spirit.previousTarget.instance)[0]
    }
    else if (targetCategory === 'summoner') {
      target = nearCharacters
        .filter(target => target.instance === spirit.owner)[0]
    }
    else {
      target = nearCharacters[Math.floor(Math.random() * nearCharacters.length)]
    }

    if (target) {
      return target
    }
    else {
      return false
    }
  }
  else {
    return false
  }
}
