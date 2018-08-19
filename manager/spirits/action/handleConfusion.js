const getAllFromHash = require('../../../redis/getAllFromHash')
const getNearbyFromGeohash = require('../../../redis/getNearbyFromGeohash')
const getOneFromList = require('../../../redis/getOneFromList')

module.exports = (spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      const interactionRadius =
        await getOneFromList('constants', 'interactionRadius')

      let [spells, nearInstance] = await Promise.all([
        getAllFromHash('list:spells'),
        getNearbyFromGeohash(
          'characters',
          spirit.latitude,
          spirit.longitude,
          interactionRadius
        ),
        getNearbyFromGeohash(
          'spirits',
          spirit.latitude,
          spirit.longitude,
          interactionRadius
        )
      ])

      spells.push('attack')

      const action = spells[Math.floor(Math.random() * spells.length)]

      const targetInstance = nearInstance[
        Math.floor(Math.random() * nearInstance.length)
      ]
      const targetInfo = await getAllFromHash(targetInstance)

      let target
      if (targetInfo.type === 'spirit') {
        const spiritInfo = await getOneFromList('spirits', targetInfo.id)
        target = Object.assign({}, spiritInfo, targetInfo)
      }
      else {
        target = targetInfo
      }

      resolve([target, action])
    }
    catch (err) {
      reject(err)
    }
  })
}
