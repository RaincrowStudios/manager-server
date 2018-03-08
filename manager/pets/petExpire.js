const constants = require('../../constants')
const timers = require('../../database/timers')
const getFromRedis = require('../components/getFromRedis')
const getNearbyFromGeohashByPoint = require('../components/getNearbyFromGeohashByPoint')
const informPlayers = require('../components/informPlayers')
const removeFromGeohash = require('./components/removeFromGeohash')
const removeFromSet = require('./components/removeFromSet')
const removeInstanceFromRedis = require('./components/removeInstanceFromRedis')

module.exports = async (instance, pet) => {
  try {
    const charactersNearLocation = await getNearbyFromGeohashByPoint(
      'Characters',
      pet.info.latitude,
      pet.info.longitude,
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
          familiar: instance
        }
      ),
      removeFromGeohash('Pets', instance),
      removeFromSet('pets', instance),
      removeInstanceFromRedis(instance)
    ])

    const petTimers = timers.by("instance", instance)
    clearTimeout(petTimers.expireTimer)
    timers.remove(petTimers)
  }
  catch (err) {
    console.error(err)
  }
}
