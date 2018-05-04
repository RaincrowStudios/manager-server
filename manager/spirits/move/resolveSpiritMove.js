const addFieldsToHash = require('../../../redis/addFieldsToHash')
const addToGeohash = require('../../../redis/addToGeohash')
const informNearbyPlayers = require('../../../utils/informNearbyPlayers')
const createMapToken = require('../../../utils/createMapToken')
const determineSpiritMove = require('./determineSpiritMove')

module.exports = (spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      const newCoords = await determineSpiritMove(spirit)

      await informNearbyPlayers(
        spirit.latitude,
        spirit.longitude,
        {
          command: 'map_spirit_remove',
          instance: spirit.instance
        }
      )

      await Promise.all([
        informNearbyPlayers(
          newCoords[0],
          newCoords[1],
          {
            command: 'map_spirit_add',
            tokens: [createMapToken(spirit.instance, spirit)]
          }
        ),
        addFieldsToHash(
          spirit.instance,
          ['latitude', 'longitude'],
          [newCoords[0], newCoords[1]]
        ),
        addToGeohash('spirits', spirit.instance, newCoords[0], newCoords[1])
      ])

      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
