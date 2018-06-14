module.exports = (spirit, nearTargets, targetCategory, targetingConditions) => {
  let validTargets = nearTargets
    .filter(target => (
      target.type === 'witch' ||
      target.type === 'vampire' ||
      target.type === 'spirit'
    ))

  if (targetCategory === 'vulnerableAll') {
    validTargets = validTargets
      .filter(target => target.status === 'vulnerable')
  }

  if (targetingConditions && targetingConditions.length) {
    validTargets = validTargets
      .filter(target => {
        for (const targetingCondition of targetingConditions) {
          if (
            target.conditions &&
            target.conditions
              .map(condition => condition.id)
              .includes(targetingCondition)
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
