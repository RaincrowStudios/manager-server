const getAndRemoveHash = require('../../../redis/getAndRemoveHash')
const updateHashFieldArray = require('../../../redis/updateHashFieldArray')
const informNearbyPlayers = require('../../../utils/informNearbyPlayers')

module.exports = (spiritInstance, targetInstance) => {
  return new Promise(async (resolve, reject) => {
      try {
        const collectible = await getAndRemoveHash(targetInstance)

        await Promise.all([
          informNearbyPlayers(
            collectible.latitude,
            collectible.longitude,
            {
              command: 'map_collectible_remove',
              instance: targetInstance
            }
          ),
          updateHashFieldArray(
            spiritInstance,
            'add',
            'carrying',
            {id: collectible.id, range: collectible.range}
          )
        ])
      }
      catch (err) {
        reject(err)
      }
    })
  }
