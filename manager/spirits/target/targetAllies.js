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

      const nearAllies = nearTargets
        .map((target, i) => {
          target.instance = nearInstances[i]
          return target
        })
        .filter(target => (target.instance === spirit.owner ||
            (spirit.coven && target.coven === spirit.coven))
          )

      if (nearAllies.length) {
        const target = nearAllies[Math.floor(Math.random() * nearAllies.length)]

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
