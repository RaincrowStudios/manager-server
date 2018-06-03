const updateHashFieldArray = require('../../../redis/updateHashFieldArray')
const getValidSpawns = require('../../../utils/getValidSpawns')

module.exports = (spirit, discovery) => {
  return new Promise(async (resolve, reject) => {
    try {
      const spawnList = await getValidSpawns(spirit.latitude, spirit.longitude)

      const discoveryPool = spawnList[discovery.type][discovery.rarity]

      const collectible =
        discoveryPool[Math.floor(Math.random() * discoveryPool)]

      await updateHashFieldArray(
        spirit.instance,
        'add',
        'carrying',
        collectible.id
      )

      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
