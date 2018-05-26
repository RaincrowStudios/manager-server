module.exports = (spirit, nearTargets, targetCategory) => {
  let nearAllies = nearTargets
    .filter(target => (
      target.type === 'witch' ||
      target.type === 'vampire' ||
      target.type === 'spirit'
    ))
    .filter(target => target.instance !== spirit.instance &&
      target.instance !== spirit.owner
    )
    .filter(target => (target.instance === spirit.owner ||
      (spirit.coven &&
        (target.coven === spirit.coven ||
          spirit.allies.map(ally => ally.coven).includes(target.coven)
        )
      )
    ))

  if (targetCategory === 'vulnerableAllies') {
    nearAllies = nearAllies.filter(ally => ally.status === 'vulnerable')
  }

  if (nearAllies.length) {
    const target = nearAllies[Math.floor(Math.random() * nearAllies.length)]

    if (target) {
      return target
    }
  }

  return false
}
