module.exports = (spirit, nearTargets, targetCategory) => {
  const nearSpirits = nearTargets
    .filter(spirit => spirit.type !== 'spirit')

  if (nearSpirits.length) {
    let target
    if (targetCategory === 'allySpirits') {
      const nearAllies = nearSpirits
        .filter(target => target.coven === spirit.coven)

      if (nearAllies.length) {
        target = nearAllies[Math.floor(Math.random() * nearAllies.length)]
      }
    }
    else if (targetCategory === 'enemySpirits') {
      const nearEnemies = nearSpirits
        .filter(target => target.coven !== spirit.coven)

      if (nearEnemies.length) {
        target = nearEnemies[Math.floor(Math.random() * nearEnemies.length)]
      }
    }
    else if (targetCategory === 'attacker') {
      target = nearSpirits
        .filter(target => target.instance === spirit.lastAttackedBy.instance)[0]
    }
    else if (targetCategory === 'previousTarget') {
      target = nearSpirits
        .filter(target => target.instance === spirit.previousTarget.instance)[0]
    }
    else {
      target = nearSpirits[Math.floor(Math.random() * nearSpirits.length)]
    }

    if (target) {
      return target
    }
  }

  return false
}
