const getNearbyFromGeohash = require('../../../redis/getNearbyFromGeohash')
const getAllFromHash = require('../../../redis/getAllFromHash')

module.exports = (spirit, targetCategory) => {
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
        nearInstances
        .filter(instance => instance !== spirit.instance && instance !== spirit.owner)
        .map(instance => getAllFromHash(instance))
      )

      let nearEnemeies = nearTargets
        .map((target, i) => {
          target.instance = nearInstances[i]
          return target
        })
        .filter(target => !spirit.coven || target.coven !== spirit.coven)

      if (targetCategory === 'vulnerableEnemies') {
        nearEnemeies = nearEnemeies.filter(enemy => enemy.status === 'vulnerable')
      }

      if (nearEnemeies.length) {
        const target =
          nearEnemeies[Math.floor(Math.random() * nearEnemeies.length)]

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
