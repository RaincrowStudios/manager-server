const constants = require('../../constants')
const timers = require('../../database/timers')
const getFromRedis = require('../../utils/getFromRedis')
const getNearbyFromGeohashByPoint = require('../../utils/getNearbyFromGeohashByPoint')
const informPlayers = require('../../utils/informPlayers')
const removeFromGeohash = require('../../utils/removeFromGeohash')
const removeFromSet = require('../../utils/removeFromSet')
const removeFromRedis = require('../../utils/removeFromRedis')

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
          command: 'map_spirit_remove',
          instance: instance
        }
      ),
      removeFromGeohash('Spirits', instance),
      removeFromSet('spirits', instance),
      removeFromRedis(instance)
    ])

    const spiritTimers = timers.by('instance', instance)
    if (spiritTimers) {
      clearTimeout(spiritTimers.expireTimer)
      clearTimeout(spiritTimers.moveTimer)
      clearTimeout(spiritTimers.actionTimer)
      timers.remove(spiritTimers)
    }
  }
  catch (err) {
    console.error(err)
  }
}
