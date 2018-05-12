module.exports = (spirit, nearTargets, targetCategory) => {
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

  if (validTargets.length) {
    const target = validTargets[Math.floor(Math.random() * validTargets.length)]
    if (target) {
      return target
    }
  }
  return false
}
