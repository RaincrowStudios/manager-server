module.exports = (spirit, nearTargets, targetCategory, targetingConditions) => {
  let validTargets = nearTargets
    .filter(target => (
      target.type === 'witch' ||
      target.type === 'vampire' ||
      target.type === 'spirit'
    ))

  if (targetCategory === 'vulnerableAll') {
    validTargets = validTargets
      .filter(target => target.state === 'vulnerable')
  }
  if (targetingConditions && targetingConditions.length) {
    validTargets = validTargets
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

  if (validTargets.length) {
    const target = validTargets[Math.floor(Math.random() * validTargets.length)]
    if (target) {
      return target
    }
  }
  return false
}
