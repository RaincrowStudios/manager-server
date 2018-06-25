const getAllFromHash = require('../../../redis/getAllFromHash')
const getNearbyFromGeohash = require('../../../redis/getNearbyFromGeohash')

module.exports = (spirit, nearTargets, targetCategory) => {
  return new Promise(async (resolve, reject) => {
    try {
      const nearCharacters= await getNearbyFromGeohash(
         'characters',
         spirit.latitude,
         spirit.longitude,
         spirit.reach
       )

     const nearInfo = await Promise.all(
       nearCharacters.map(instance => getAllFromHash(instance))
     )

     nearTargets = nearInfo
      .map((target, i) => {
         if (target) {
           target.instance = nearCharacters[i]
           return target
         }
       })
       .filter(target => target && target.state === 'dead')

      let target = false
      if (targetCategory === 'deadSummoner') {
        [target] = nearTargets
          .filter(target => target.instance === spirit.owner)
      }
      else {
        target = nearTargets[Math.floor(Math.random() * nearTargets.length)]
      }

      if (target) {
        resolve(target)
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
