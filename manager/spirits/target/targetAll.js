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
        .filter(instance => instance !== spirit.instance)

      const nearInfo = await Promise.all(
        nearInstances.map(instance => getAllFromHash(instance))
      )

      let nearTargets = nearInfo.map((target, i) => {
        if (target) {
          target.instance = nearInstances[i]
          return target
        }
      })
      .filter(target => target && target.status !== 'dead')

      if (targetCategory === 'vulnerableAll') {
        nearTargets = nearTargets
          .filter(target => target.status === 'vulnerable')
      }

      if (nearTargets.length) {
        const target =
          nearTargets[Math.floor(Math.random() * nearTargets.length)]
        if (target) {
          resolve(target)
        }
      }
      resolve(false)
    }
    catch (err) {
      reject(err)
    }
  })
}
