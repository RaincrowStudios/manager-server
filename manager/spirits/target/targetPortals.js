const getNearbyFromGeohash = require('../../../redis/getNearbyFromGeohash')
const getAllFromHash = require('../../../redis/getAllFromHash')

module.exports = (spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
     const nearPortals = await getNearbyFromGeohash(
        'portals',
        spirit.latitude,
        spirit.longitude,
        spirit.reach
      )

      if (nearPortals.length > 0) {
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
      else {
        resolve(false)
      }
    }
    catch (err) {
      reject(err)
    }
  })
}
