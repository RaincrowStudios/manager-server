const getNearbyFromGeohash = require('../../../redis/getNearbyFromGeohash')
const getAllFromHash = require('../../../redis/getAllFromHash')

module.exports = (spirit, targetCategory) => {
  return new Promise(async (resolve, reject) => {
    try {
     const nearInstances = await getNearbyFromGeohash(
        'collectibles',
        spirit.latitude,
        spirit.longitude,
        spirit.reach
      )

      if (nearInstances.length) {
        let nearCollectibles = await Promise.all(
          nearInstances.map(instance => getAllFromHash(instance))
        )
        if (targetCategory) {
          nearCollectibles = nearCollectibles
            .map((collectible, i) => {
              collectible.instance = nearInstances[i]
              return collectible
            })
            .filter(collectible => {
              if (
                collectible.id === targetCategory ||
                collectible.type === targetCategory
              ) {
                return collectible
              }
            })
        }
        const target =
            nearCollectibles[Math.floor(Math.random() * nearCollectibles.length)]

        if (target) {
          resolve(target)
        }
        else {
          resolve(false)
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
