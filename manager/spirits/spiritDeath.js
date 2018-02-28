const timers = require('../../database/timers')
const informPlayers = require('../../utils/informPlayers')
const removeFromGeohash = require('../../utils/removeFromGeohash')
const removeFromSet = require('../../utils/removeFromSet')
const removeFromRedis = require('../../utils/removeFromRedis')

module.exports = (instance, spirit, killer) => {
  return new Promise(async (resolve, reject) => {
    try {
      await Promise.all([
        informPlayers(
          [spirit.info.ownerPlayer],
          {
            command: 'player_spirit_death',
            instance: instance,
            killer,
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
        killedBy: killer,
        type: spirit.id,
        owner: spirit.ownerPlayer
      })

      const spiritTimers = timers.by("instance", instance)
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
