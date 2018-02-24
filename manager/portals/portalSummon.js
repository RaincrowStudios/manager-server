const uuidv1 = require('uuid/v1')
const constants = require('../../constants/constants')
const timers = require('../../database/timers')
const getFromRedis = require('../../utils/getFromRedis')
const getNearbyFromGeohashByPoint = require('../../utils/getNearbyFromGeohashByPoint')
const informPlayers = require('../../utils/informPlayers')
const addToGeohash = require('../../utils/addToGeohash')
const addToRedis = require('../../utils/addToRedis')
const addToSet = require('../../utils/addToSet')

module.exports = async (instance, portal) => {
  try {
    const spiritInstance = uuidv1()
    spiritAdd(spiritInstance, portal.info.spirit)

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

    await informPlayers(
      playersToInform,
      {
        command: 'map_add',
        spirit: instance,
        token: portal.info.spirit.mapToken
      }
    )
  }
  catch (err) {
    console.error(err)
  }
}
