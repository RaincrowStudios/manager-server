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
      const [newLatitude, newLongitude] = await determineSpiritMove(spirit, direction)

      const update = [
        updateHashField(spirit.instance, 'latitude', newLatitude),
        updateHashField(spirit.instance, 'longitude', newLongitude),
        moveInGeohash('spirits', spirit.instance, newLatitude, newLongitude)
      ]

      const inform = [
        {
          function: informNearbyPlayersUnion,
          parameters: [
            spirit,
            {
              latitude: newLatitude,
              longitude: newLongitude
            },
            {
              command: 'map_token_move',
              token: createMapToken(spirit)
            },
            Object.values(spirit.conditions)
              .filter(condition => condition.status === 'invisible').length ?
              1 : 0
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
