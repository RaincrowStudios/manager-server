const getNearbyFromGeohashByPoint = require('../../../utils/getNearbyFromGeohashByPoint')

module.exports = (spirit) => {
  return Promise.new(async (resolve, reject) => {
    try {
      for (const potentialTarget of spirit.targets) {
        switch (potoentialTarget) {
          case '':
          case '':
          
        }
        if (potoentialTarget === 'Self') {
          resolve('Self')
        }
        const targets = await getNearbyFromGeohashByPoint(
          potentialTarget,
          spirit.latitude,
          spirit.longitude,
          spirit.reach
        )
        if (targets.length !== 0) {
          const target =
            await getFromRedis(targets[Math.floor(Math.random() * targets.length)])
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
