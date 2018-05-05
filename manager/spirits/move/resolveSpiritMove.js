const addFieldsToHash = require('../../../redis/addFieldsToHash')
const addToGeohash = require('../../../redis/addToGeohash')
const informNearbyPlayersUnion = require('../../../utils/informNearbyPlayersUnion')
const createMapToken = require('../../../utils/createMapToken')
const determineSpiritMove = require('./determineSpiritMove')

module.exports = (spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      const newCoords = await determineSpiritMove(spirit)

      await Promise.all([
        informNearbyPlayersUnion(
          [spirit.latitude, spirit.longitude],
          newCoords,
          {
            command: 'map_spirit_move',
            token: createMapToken(spirit.instance, spirit)

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
