const moveInGeohash = require('../../../redis/moveInGeohash')
const updateHashField = require('../../../redis/updateHashField')
const informNearbyPlayersUnion = require('../../../utils/informNearbyPlayersUnion')
const createMapToken = require('../../../utils/createMapToken')
const determineDirection = require('./determineDirection')
const determineSpiritMove = require('./determineSpiritMove')

module.exports = (spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      const direction = await determineDirection(spirit)
      const newCoords = await determineSpiritMove(spirit, direction)

      const update = [
        updateHashField(spirit.instance, 'latitude', newCoords[0]),
        updateHashField(spirit.instance, 'longitude', newCoords[1]),
        moveInGeohash('spirits', spirit.instance, newCoords[0], newCoords[1])
      ]

      const inform = [
        {
          function: informNearbyPlayersUnion,
          parameters: [
            spirit,
            {
              latitude: newCoords[0],
              longitude: newCoords[1]
            },
            {
              command: 'map_spirit_move',
              token: createMapToken(spirit.instance, spirit)
            }
          ]
        }
      ]

      resolve([update, inform])
    }
    catch (err) {
      reject(err)
    }
  })
}
