const getNearbyFromGeohash = require('../../../redis/getNearbyFromGeohash')
const getAllFromHash = require('../../../redis/getAllFromHash')

module.exports = (spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
     const nearCharacters = await getNearbyFromGeohash(
        'characters',
        spirit.latitude,
        spirit.longitude,
        spirit.reach
      )
      const nearSpirits = await getNearbyFromGeohash(
         'spirits',
         spirit.latitude,
         spirit.longitude,
         spirit.reach
       )

      const nearInstances = [...nearCharacters, ...nearSpirits]

      const nearTargets = await Promise.all(
        nearInstances.map(instance => getAllFromHash(instance))
      )

      let nearEnemeies = nearTargets
        .map((target, i) => {
          if (target) {
            target.instance = nearInstances[i]
          }
          return target
        })
        .filter(target => target && target.instance !== spirit.instance && target.instance !== spirit.owner)
        .filter(target => !spirit.coven || target.coven !== spirit.coven)

      if (nearEnemeies.length) {
        const destinationLat = nearEnemeies
          .map(enemy => enemy.latitude)
          .reduce((acc, current) => acc + current)/nearEnemeies.length

        const destinationLong = nearEnemeies
          .map(enemy => enemy.longitude)
          .reduce((acc, current) => acc + current)/nearEnemeies.length

        resolve({latitude: destinationLat * -1, longitude: destinationLong * -1})
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
