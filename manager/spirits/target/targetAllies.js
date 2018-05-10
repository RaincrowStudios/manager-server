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
        nearInstances.map(instance => getAllFromHash(instance))
      )

      let nearAllies = nearTargets
        .map((target, i) => {
          if (target) {
            target.instance = nearInstances[i]
            return target
          }
        })
        .filter(target => target.status !== 'dead')
        .filter(target => target.instance !== spirit.instance && target.instance !== spirit.owner)
        .filter(target => (target.instance === spirit.owner ||
          (spirit.coven && target.coven === spirit.coven)
        ))

      if (targetCategory === 'vulnerableAllies') {
        nearAllies = nearAllies.filter(ally => ally.status === 'vulnerable')
      }

      if (nearAllies.length) {
        const target = nearAllies[Math.floor(Math.random() * nearAllies.length)]

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
