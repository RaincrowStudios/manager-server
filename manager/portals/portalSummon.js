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
const createMapToken = require('../../utils/createMapToken')
const spiritAdd = require('../spirits/spiritAdd')

module.exports = async (instance, portal) => {
  try {
    const currentTime = Date.now()
    const spiritInstance = uuidv1()
    let spirit = portal.spirit

    spirit.createdOn = currentTime
    spirit.expiresOn = currentTime
    spirit.moveOn = currentTime
    spirit.actionOn = currentTime

    spirit.summonLat = portal.latitude
    spirit.summonLong = portal.longitude
    spirit.latitude = portal.latitude
    spirit.longitude = portal.longitude

    spiritAdd(spiritInstance, spirit)

    const charactersNearLocation = await getNearbyFromGeohashByPoint(
      'Characters',
      portal.latitude,
      portal.longitude,
      constants.radiusVisual
    )

    const playersToInform = charactersNearLocation.length !== 0 ?
      await Promise.all(
        charactersNearLocation.map(async (character) => {
          const characterInfo = await getFromRedis(character[0])
          return characterInfo.owner
        })
      ) : []

    let spiritToken = createMapToken(spirit)
    spiritToken.instance = spiritInstance

    await Promise.all([
      informPlayers(
        playersToInform,
        {
          command: 'map_remove',
          instance: instance
        }
      ),
      informPlayers(
        playersToInform,
        {
          command: 'map_add',
          tokens: [spiritToken]
        }
      ),
      informPlayers(
        [spirit.owner],
        {
          command: 'player_spirit_summon',
          spirit: spirit.displayName
        }
      ),
      addToGeohash(
        'Spirits',
        spiritInstance,
        [spirit.latitude, spirit.longitude]
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
