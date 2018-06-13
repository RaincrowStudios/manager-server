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
    else if (targetCategory === 'summonerPortals') {
      const nearSummonerPortals = nearPortals
        .filter(portal => portal.owner === spirit.owner)

      target = nearSummonerPortals[Math.floor(Math.random() * nearSummonerPortals.length)]
    }
    else if (targetCategory === 'summonerPortalAttacker') {
      const summonerPortal = nearPortals
        .filter(portal => portal.owner === spirit.owner)[0]

      if (summonerPortal && summonerPortal.lastAttackedBy) {
        target = nearTargets
          .filter(target =>
            target.instance === summonerPortal.lastAttackedBy.instance
          )[0]
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
