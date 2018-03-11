const constants = require('../../../constants')
const getInfoFromRedis = require('../../../utils/getInfoFromRedis')
const getNearbyFromGeohashByPoint = require('../../../utils/getNearbyFromGeohashByPoint')
const informPlayers = require('../../../utils/informPlayers')
const addToGeohash = require('../../../utils/addToGeohash')
const addToRedis = require('../../../utils/addToRedis')
const createMapToken = require('../../../utils/createMapToken')
const determineSpiritMove = require('./determineSpiritMove')

module.exports = (instance, spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      const charactersNearOldLocation =
        await getNearbyFromGeohashByPoint(
          'Characters',
          spirit.latitude,
          spirit.longitude,
          constants.maxRadius
        )

      const playersToRemoveSpirit = charactersNearOldLocation.length !== 0 ?
        await Promise.all(
          charactersNearOldLocation.map(async (character) => {
            const characterInfo = await getInfoFromRedis(character[0])
            return characterInfo.owner
          })
        ) : []

      const newCoords = await determineSpiritMove(spirit)

      console.log({
        'event': 'spirit_move',
        spirit: instance,
        type: spirit.id,
        owner: spirit.ownerPlayer,
        to: [newCoords[0], newCoords[1]]
      })
      spirit.latitude = newCoords[0]
      spirit.longitude = newCoords[1]

      const charactersNearNewLocation =
        await getNearbyFromGeohashByPoint(
          'Characters',
          spirit.latitude,
          spirit.longitude,
          constants.maxRadius
        )

      const playersToAddSpirit = charactersNearNewLocation.length !== 0 ?
        await Promise.all(
          charactersNearNewLocation.map(async (character) => {
            const characterInfo = await getInfoFromRedis(character[0])
            return characterInfo.owner
          })
        ) : []

      await informPlayers(
        playersToRemoveSpirit,
        {
          command: 'map_spirit_remove',
          instance: instance
        }
      )

      await Promise.all([
        informPlayers(
          playersToAddSpirit,
          {
            command: 'map_spirit_add',
            tokens: [
              createMapToken(spirit)
            ]
          }
        ),
        addToRedis(instance, spirit),
        addToGeohash('Spirits', instance, newCoords)
      ])
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
