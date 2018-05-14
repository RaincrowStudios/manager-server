const addFieldToHash = require('../../../redis/addFieldToHash')
const moveInGeohash = require('../../../redis/moveInGeohash')
const informNearbyPlayersUnion = require('../../../utils/informNearbyPlayersUnion')
const createMapToken = require('../../../utils/createMapToken')
const determineDirection = require('./determineDirection')
const determineSpiritMove = require('./determineSpiritMove')

module.exports = (spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      const direction = await determineDirection(spirit)
      const newCoords = await determineSpiritMove(spirit, direction)

      await Promise.all([
        informNearbyPlayersUnion(
          [spirit.latitude, spirit.longitude],
          newCoords,
          {
            command: 'map_spirit_move',
            token: createMapToken(spirit.instance, spirit)
          }
        ),
        addFieldToHash(spirit.instance, 'latitude', newCoords[0]),
        addFieldToHash(spirit.instance, 'longitude', newCoords[1]),
        moveInGeohash('spirits', spirit.instance, newCoords[0], newCoords[1])
      ])

      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
