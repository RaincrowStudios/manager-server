const getNearbyFromGeohash = require('../../../redis/getNearbyFromGeohash')
const getAllFromHash = require('../../../redis/getAllFromHash')

module.exports = (spirit, targetCategory) => {
  return new Promise(async (resolve, reject) => {
    try {
      let nearInstances = await getNearbyFromGeohash(
        'spirits',
        spirit.latitude,
        spirit.longitude,
        spirit.reach
      )

      nearInstances = nearInstances
        .filter(instance => instance !== spirit.instance)

      const nearInfo = await Promise.all(
          nearInstances.map(instance => getAllFromHash(instance))
        )

      const nearSpirits = nearInfo.map((spirit, i) => {
          spirit.instance = nearInstances[i]
          return spirit
        })

      if (nearSpirits.length) {
        if (targetCategory === 'allySpirits') {
          const nearAllies = nearSpirits
            .filter(target => target.coven === spirit.coven)

          if (nearAllies.length > 0) {
            const target =
              nearAllies[Math.floor(Math.random() * nearAllies.length)]

            resolve(target)
          }
        }
        else if (targetCategory === 'enemySpirits') {
          const nearEnemies = nearSpirits
            .filter(target => target.coven !== spirit.coven)

          if (nearEnemies.length) {
            const target =
              nearEnemies[Math.floor(Math.random() * nearEnemies.length)]

            resolve(target)
          }
        }
        else if (targetCategory === 'attacker') {
          const targets = nearSpirits
            .filter(target => target.instance === spirit.lastAttackedBy)

          if (targets.length) {
            resolve(targets[0])
          }
        }
        else if (targetCategory === 'previousTarget') {
          const targets = nearSpirits
            .filter(target => target.instance === spirit.previousTarget)

          if (targets.length) {
            resolve(targets[0])
          }
        }
        else {
          const target =
            nearSpirits[Math.floor(Math.random() * nearSpirits.length)]

          if (target) {
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
