const removeFromAll = require('../../../redis/removeFromAll')
const updateHashFieldArray = require('../../../redis/updateHashFieldArray')
const informNearbyPlayers = require('../../../utils/informNearbyPlayers')

module.exports = (spirit, collectible) => {
  return new Promise(async (resolve, reject) => {
    try {
      const update = []
      const inform = []

      inform.push(
        {
          function: informNearbyPlayers,
          parameters: [
            collectible,
            {
              command: 'map_token_remove',
              instance: collectible.instance
            }
          ]
        }
      )

      update.push(
        removeFromAll('collectibles', collectible.instance),
        updateHashFieldArray(
          spirit.instance,
          'add',
          'carrying',
          {id: collectible.id}
        )
      )

      resolve([update, inform])
    }
    catch (err) {
      reject(err)
    }
  })
}
