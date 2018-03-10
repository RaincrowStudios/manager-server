const constants = require('../../constants')
const timers = require('../../database/timers')
const getInfoFromRedis = require('../../utils/getInfoFromRedis')
const getNearbyFromGeohashByPoint = require('../../utils/getNearbyFromGeohashByPoint')
const informPlayers = require('../../utils/informPlayers')
const removeFromGeohash = require('../../utils/removeFromGeohash')
const removeFromSet = require('../../utils/removeFromSet')
const removeFromRedis = require('../../utils/removeFromRedis')

module.exports = async (instance, spirit) => {
  try {
    const charactersNearLocation = await getNearbyFromGeohashByPoint(
      'Characters',
      spirit.latitude,
      spirit.longitude,
      constants.maxDisplay
    )

    const playersToInform = charactersNearLocation.length !== 0 ?
      await Promise.all(
        charactersNearLocation.map(async (character) => {
          const characterInfo = await getInfoFromRedis(character[0])
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

    console.log({
      event: 'spirit_expired',
      spirit: instance,
      owner: spirit.ownerPlayer,
    })

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
