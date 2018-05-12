module.exports = (spirit, nearTargets, targetCategory) => {
  const nearCharacters = nearTargets
    .filter(target => target.type === 'witch' || target.type === 'vampire')

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
    else {
      target = nearCharacters[Math.floor(Math.random() * nearCharacters.length)]
    }
    if (target) {
      return target
    }
  }

  return false
}
