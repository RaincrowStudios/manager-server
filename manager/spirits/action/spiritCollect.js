const removeFromAll = require('../../../redis/removeFromAll')
const updateHashFieldArray = require('../../../redis/updateHashFieldArray')
const informNearbyPlayersUnion = require('../../../utils/informNearbyPlayersUnion')

module.exports = (spirit, collectible) => {
  return new Promise(async (resolve, reject) => {
      try {
        await Promise.all([
          informNearbyPlayersUnion(
            [parseFloat(collectible.latitude, 10),
            parseFloat(collectible.longitude, 10)],
            [parseFloat(spirit.latitude, 10),
            parseFloat(spirit.longitude, 10)],
            {
              command: 'map_spirit_collect',
              spirit: spirit.instance,
              collectible: collectible.instance
            }
          ),
          removeFromAll('collectibles', collectible.instance),
          updateHashFieldArray(
            spirit.instance,
            'add',
            'carrying',
            collectible.id
          )
        ])

        resolve(true)
      }
      catch (err) {
        reject(err)
      }
    })
  }
