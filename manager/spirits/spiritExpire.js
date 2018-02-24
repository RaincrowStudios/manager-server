const constants = require('../../constants/constants')
const timers = require('../../database/timers')
const getFromRedis = require('../../utils/getFromRedis')
const getNearbyFromGeohashByPoint = require('../../utils/getNearbyFromGeohashByPoint')
const informPlayers = require('../../utils/informPlayers')
const removeFromGeohash = require('./../utils/removeFromGeohash')
const removeFromSet = require('./../utils/removeFromSet')
const removeInstanceFromRedis = require('./../utils/removeInstanceFromRedis')

module.exports = async (instance, spirit) => {
  try {
    const charactersNearLocation = await getNearbyFromGeohashByPoint(
      'Characters',
      spirit.info.latitude,
      spirit.info.longitude,
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
          instance: instance
        }
      ),
      removeFromGeohash('Spirits', instance),
      removeFromSet('spirits', instance),
      removeInstanceFromRedis(instance)
    ])

    const spiritTimers = timers.by("instance", instance)
    clearTimeout(spiritTimers.expireTimer)
    clearTimeout(spiritTimers.moveTimer)
    clearTimeout(spiritTimers.actionTime)
    timers.remove(spiritTimers)
  }
  catch (err) {
    console.error(err)
  }
}
