const uuidv1 = require('uuid/v1')
const constants = require('../../constants')
const getFromRedis = require('../../utils/getFromRedis')
const getNearbyFromGeohashByPoint = require('../../utils/getNearbyFromGeohashByPoint')
const informPlayers = require('../../utils/informPlayers')
const addToGeohash = require('../../utils/addToGeohash')
const addToRedis = require('../../utils/addToRedis')
const addToSet = require('../../utils/addToSet')
const removeFromGeohash = require('../../utils/removeFromGeohash')
const removeFromSet = require('../../utils/removeFromSet')
const removeFromRedis = require('../../utils/removeFromRedis')
const spiritAdd = require('../spirits/spiritAdd')

module.exports = async (instance, portal) => {
  try {
    const currentTime = new Date()
    const spiritInstance = uuidv1()
    let spirit = portal.info.spirit

    spirit.createdOn = currentTime
    spirit.expiresOn = currentTime
    spirit.moveOn = currentTime
    spirit.actionOn = currentTime

    spirit.summonLat = portal.info.latitude
    spirit.summonLong = portal.info.longitude
    spirit.latitude = portal.info.latitude
    spirit.longitude = portal.info.longitude

    spiritAdd(spiritInstance, spirit)

    const charactersNearLocation = await getNearbyFromGeohashByPoint(
      'Characters',
      portal.info.latitude,
      portal.info.longitude,
      constants.radiusVisual
    )

    const playersToInform = charactersNearLocation.length !== 0 ?
      await Promise.all(
        charactersNearLocation.map(async (character) => {
          const characterInfo = await getFromRedis(character[0], 'info')
          return characterInfo.owner
        })
      ) : []

    await Promise.all([
      informPlayers(
        playersToInform,
        {
          command: 'map_remove',
          spirit: instance
        }
      ),
      informPlayers(
        playersToInform,
        {
          command: 'map_add',
          spirit: spiritInstance,
          token: spirit.mapToken
        }
      ),
      informPlayers(
        [spirit.info.owner],
        {
          command: 'player_spirit_summon',
          spirit: spirit.info.displayName
        }
      ),
      addToGeohash(
        'Spirits',
        spiritInstance,
        [spirit.info.latitude, spirit.info.longitude]
      ),
      addToRedis(spiritInstance, spirit),
      addToSet('spirits', spiritInstance),
      removeFromGeohash('Portals', instance),
      removeFromRedis(instance),
      removeFromSet('portals', instance)
    ])
  }
  catch (err) {
    console.error(err)
  }
}
