const getNearbyFromGeohash = require('../../../redis/getNearbyFromGeohash')
const getAllFromHash = require('../../../redis/getAllFromHash')

module.exports = (spirit, targetCategory) => {
  return new Promise(async (resolve, reject) => {
    try {
     const nearPortals = await getNearbyFromGeohash(
        'portals',
        spirit.latitude,
        spirit.longitude,
        spirit.reach
      )

      if (nearPortals.length > 0) {
        if (targetCategory === 'allyPortals') {
          const nearAllyPortals = nearPortals
            .filter(portal => portal.summonerCoven === spirit.summonerCoven)

          if (nearAllyPortals.length > 0) {
            const target = nearAllyPortals[
                Math.floor(Math.random() * nearAllyPortals.length)
              ]

            resolve(target)
          }
          else {
            resolve(false)
          }
        }
        else if (targetCategory === 'enemyPortals') {
          const nearEnemyPortals = nearPortals
            .filter(portal => portal.summonerCoven !== spirit.summonerCoven)

          if (nearEnemyPortals.length > 0) {
            const target = nearEnemyPortals[
                Math.floor(Math.random() * nearEnemyPortals.length)
              ]

            resolve(target)
          }
          else {
            resolve(false)
          }
        }
        else {
          const index = Math.floor(Math.random() * nearPortals.length)
          const target = await getAllFromHash(nearPortals[index])

          if (target) {
            target.instance = nearPortals[index]
            resolve(target)
          }
          else {
            resolve(false)
          }
        }
      }
      else {
        resolve(false)
      }
    }
    catch (err) {
      reject(err)
    }
  })
}
