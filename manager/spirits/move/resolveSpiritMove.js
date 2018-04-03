const addFieldsToHash = require('../../../redis/addFieldsToHash')
const addToGeohash = require('../../../redis/addToGeohash')
const informNearbyPlayers = require('../../../utils/informNearbyPlayers')
const createMapToken = require('../../../utils/createMapToken')
const determineSpiritMove = require('./determineSpiritMove')

module.exports = (instance, spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      const newCoords = await determineSpiritMove(spirit)

      /*console.log({
        'event': 'spirit_move',
        instance: instance,
        spirit: spirit.id,
        owner: spirit.ownerPlayer,
        to: [newCoords[0], newCoords[1]]
      })*/

      await informNearbyPlayers(
        spirit.latitude,
        spirit.longitude,
        {
          command: 'map_spirit_remove',
          instance: instance
        }
      )

      await Promise.all([
        informNearbyPlayers(
          newCoords[0],
          newCoords[1],
          {
            command: 'map_spirit_add',
            tokens: [createMapToken(instance, spirit)]
          }
        ),
        addFieldsToHash(
          instance,
          ['latitude', 'longitude'],
          [newCoords[0], newCoords[1]]
        ),
        addToGeohash('spirits', instance, newCoords[0], newCoords[1])
      ])
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
