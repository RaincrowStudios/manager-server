const getAndRemove = require('../../../redis/getAndRemove')
const informNearbyPlayers = require('../../../utils/informNearbyPlayers')


module.exports = (spiritInstance, targetInstance) => {
  return new Promise(async (resolve, reject) => {
      try {
        const collectible = await getAndRemove(targetInstance)

        const spirit = await getAndUpdate(spiritInstance)

        await Promise.all([
          informNearbyPlayers(
            collectible.latitude,
            collectible.longitude,
            {
              command: 'map_coll_remove',
              instance: targetInstance
            }
          ),
        ])
      }
      catch (err) {
        reject(err)
      }
    })
  }
