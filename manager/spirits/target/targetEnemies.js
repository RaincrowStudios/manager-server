module.exports = (spirit, nearTargets, targetCategory, targetingConditions) => {
  let nearEnemies = nearTargets
    .filter(target => (
      target.type === 'witch' ||
      target.type === 'vampire' ||
      target.type === 'spirit'
    ))
    .filter(target => target.instance !== spirit.instance && target.instance !== spirit.owner)
    .filter(target => !spirit.coven ||
      (target.coven !== spirit.coven &&
        !spirit.allies.map(ally => ally.coven).includes(target.coven)
      )
    )

  if (targetCategory === 'vulnerableEnemies') {
    nearEnemies = nearEnemies.filter(enemy => enemy.state === 'vulnerable')
  }

  if (targetingConditions && targetingConditions.length) {
    nearEnemies = nearEnemies
      .filter(target => {
        for (const targetingCondition of targetingConditions) {
          if (
            target.conditions &&
            Object.values(target.conditions)
              .filter(condition => condition.id === targetingCondition)
              .length
          ) {
            return true
          }
        }
        return false
      })
  }

  if (nearEnemies.length) {
    const target = nearEnemies[Math.floor(Math.random() * nearEnemies.length)]

    if (target) {
      return target
    }
  }

  return false
}
