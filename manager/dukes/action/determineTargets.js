const getNearbyFromGeohash = require('../../../redis/getNearbyFromGeohash')
const getAllFromHash = require('../../../redis/getAllFromHash')

module.exports = (duke) => {
  return new Promise(async (resolve, reject) => {
    try {
      const [nearCharacters, nearPortals, nearSpirits] =
        await Promise.all([
          getNearbyFromGeohash(
            'characters',
            duke.latitude,
            duke.longitude,
            duke.reach
          ),
          getNearbyFromGeohash(
            'portals',
            duke.latitude,
            duke.longitude,
            duke.reach
          ),
          getNearbyFromGeohash(
            'spirits',
            duke.latitude,
            duke.longitude,
            duke.reach
          )
        ])

      const nearInstances = [...nearCharacters, ...nearPortals, ...nearSpirits]

      const nearTargets = await Promise.all(
        nearInstances.map(instance => getAllFromHash(instance))
      )

      resolve(nearTargets)
    }
    catch (err) {
      reject(err)
    }
  })
}
