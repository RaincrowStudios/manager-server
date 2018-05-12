module.exports = (spirit, nearTargets, targetCategory) => {
 const nearPortals = nearTargets.filter(target => target.type === 'portal')

 let target
  if (nearPortals.length) {
    if (targetCategory === 'allyPortals') {
      const nearAllyPortals = nearPortals
        .filter(portal => portal.coven === spirit.coven)

      if (nearAllyPortals.length) {
        target = nearAllyPortals[
            Math.floor(Math.random() * nearAllyPortals.length)
          ]
      }
    }
    else if (targetCategory === 'enemyPortals') {
      const nearEnemyPortals = nearPortals
        .filter(portal => portal.coven !== spirit.coven)

      if (nearEnemyPortals.length) {
        target = nearEnemyPortals[
            Math.floor(Math.random() * nearEnemyPortals.length)
          ]
      }
    }
    else {
      target = nearPortals[Math.floor(Math.random() * nearPortals.length)]
    }

    if (target) {
      return target
    }
  }

 return false
}
