const constants = require('../../constants')
const timers = require('../../database/timers')
const informPlayers = require('../../utils/informPlayers')
const getNearbyFromGeohashByPoint = require('../../utils/getNearbyFromGeohashByPoint')
const getInfoFromRedis = require('../../utils/getInfoFromRedis')
const removeFromGeohash = require('../../utils/removeFromGeohash')
const removeFromSet = require('../../utils/removeFromSet')
const removeFromRedis = require('../../utils/removeFromRedis')
const addSpiritDrop = require('./death/addSpiritDrop')

module.exports = (instance, spirit, killer) => {
  return new Promise(async (resolve, reject) => {
    try {
      const charactersNearLocation = await getNearbyFromGeohashByPoint(
        'Characters',
        spirit.latitude,
        spirit.longitude,
        constants.maxDisplay
      )

      const nearPlayers = charactersNearLocation.length !== 0 ?
        await Promise.all(
          charactersNearLocation.map(async (character) => {
            const characterInfo = await getInfoFromRedis(character[0])
            return characterInfo.owner
          })
        ) : []

      if (spirit.drop.length !== 0) {
        const dropTokens = await addSpiritDrop(spirit)
        await informPlayers(
          nearPlayers,
          {
            command: 'map_collectible_add',
            tokens: dropTokens,
          }
        )
      }

      await Promise.all([
        informPlayers(
          nearPlayers,
          {
            command: 'map_spirit_remove',
            instance: instance,
          }
        ),
        informPlayers(
          [spirit.ownerPlayer],
          {
            command: 'player_spirit_death',
            instance: instance,
            killer: killer,
            displayName: spirit.displayName
          }
        ),
        removeFromGeohash('Spirits', instance),
        removeFromSet('spirits', instance),
        removeFromRedis(instance)
      ])

      console.log({
        event: 'spirit_death',
        spirit: instance,
        killer: killer,
        type: spirit.type,
        owner: spirit.ownerPlayer
      })

      const spiritTimers = timers.by('instance', instance)
      if (spiritTimers) {
        clearTimeout(spiritTimers.expireTimer)
        clearTimeout(spiritTimers.moveTimer)
        clearTimeout(spiritTimers.actionTimer)
        timers.remove(spiritTimers)
      }
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
