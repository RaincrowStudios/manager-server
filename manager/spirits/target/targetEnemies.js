module.exports = (spirit, nearTargets, targetCategory) => {
  let nearEnemies = nearTargets
    .filter(target => (
      target.type === 'witch' ||
      target.type === 'vampire' ||
      target.type === 'spirit'
    ))
    .filter(target => target.instance !== spirit.instance && target.instance !== spirit.owner)
    .filter(target => !spirit.coven || target.coven !== spirit.coven)

  if (targetCategory === 'vulnerableEnemies') {
    nearEnemies = nearEnemies.filter(enemy => enemy.status === 'vulnerable')
  }

  if (nearEnemies.length) {
    const target = nearEnemies[Math.floor(Math.random() * nearEnemies.length)]

    if (target) {
      return target
    }
  }

  return false
}
