const getNearbyFromGeohash = require('../../../redis/getNearbyFromGeohash')
const getAllFromHash = require('../../../redis/getAllFromHash')

module.exports = (spirit, targetCategory) => {
  return new Promise(async (resolve, reject) => {
    try {
      let nearInstances = await getNearbyFromGeohash(
        'characters',
        spirit.latitude,
        spirit.longitude,
        spirit.reach
      )

      const nearInfo = await Promise.all(
          nearInstances.map(instance => getAllFromHash(instance))
        )

      const nearCharacters = nearInfo.map((character, i) => {
          character.instance = nearInstances[i]
          return character
        })

      if (nearCharacters.length > 0) {
        if (targetCategory === 'allyWitch') {
          const nearAllies = nearCharacters
            .filter(target => target.coven === spirit.coven)

          if (nearAllies.length > 0) {
            const target =
              nearAllies[Math.floor(Math.random() * nearAllies.length)]

            resolve(target)
          }
        }
        else if (targetCategory === 'enemyWitch') {
          const nearEnemies = nearCharacters
            .filter(target => target.coven !== spirit.coven)

          if (nearEnemies.length > 0) {
            const target =
              nearEnemies[Math.floor(Math.random() * nearEnemies.length)]

            resolve(target)
          }
        }
        else if (targetCategory === 'attacker') {
          const targets = nearCharacters
            .filter(target => target.instance === spirit.lastAttackedBy)

          if (targets.length > 0) {
            resolve(targets[0])
          }
        }
        else if (targetCategory === 'previousTarget') {
          const targets = nearCharacters
            .filter(target => target.instance === spirit.previousTarget)

          if (targets.length > 0) {
            resolve(targets[0])
          }
        }
        else {
          const target =
            nearCharacters[Math.floor(Math.random() * nearCharacters.length)]

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
