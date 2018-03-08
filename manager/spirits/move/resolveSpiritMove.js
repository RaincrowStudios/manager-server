const constants = require('../../../constants')
const getFromRedis = require('../../../utils/getFromRedis')
const getNearbyFromGeohashByPoint = require('../../../utils/getNearbyFromGeohashByPoint')
const informPlayers = require('../../../utils/informPlayers')
const updateGeohash = require('../../../utils/updateGeohash')
const updateRedis = require('../../../utils/updateRedis')
const determineSpiritMove = require('./determineSpiritMove')

module.exports = (instance, spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      const charactersNearOldLocation =
        await getNearbyFromGeohashByPoint(
          'Characters',
          spirit.info.latitude,
          spirit.info.longitude,
          constants.radiusVisual
        )

      const playersToRemoveSpirit = charactersNearOldLocation.length !== 0 ?
        await Promise.all(
          charactersNearOldLocation.map(async (character) => {
            const characterInfo = await getFromRedis(character[0], 'info')
            return characterInfo.owner
          })
        ) : []

      const newCoords = determineSpiritMove(spirit.info)
      /*console.log({
        'event': 'spirit_move',
        spirit: instance,
        type: spirit.info.id,
        owner: spirit.info.ownerPlayer,
        to: [newCoords[0], newCoords[1]]
      })*/
      spirit.info.latitude = newCoords[0]
      spirit.info.longitude = newCoords[1]
      spirit.mapToken.latitude = newCoords[0]
      spirit.mapToken.longitude = newCoords[1]

      const charactersNearNewLocation =
        await getNearbyFromGeohashByPoint(
          'Characters',
          spirit.info.latitude,
          spirit.info.longitude,
          constants.radiusVisual
        )

      const playersToAddSpirit = charactersNearNewLocation.length !== 0 ?
        await Promise.all(
          charactersNearNewLocation.map(async (character) => {
            const characterInfo = await getFromRedis(character[0], 'info')
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
            instance: instance,
            type: spirit.info.type,
            token: spirit.mapToken
          }
        ),
        updateRedis(
          instance,
          [
            'info',
            'mapSelection',
            'mapToken'
          ],
          [
            spirit.info,
            spirit.mapSelection,
            spirit.mapToken
          ]
        ),
        updateGeohash(
          'Spirits',
          instance,
          spirit.info.latitude,
          spirit.info.longitude
        )
      ])
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
