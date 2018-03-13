const timers = require('../../database/timers')
const removeInstance = require('../../redis/removeInstance')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')
const informPlayers = require('../../utils/informPlayers')
const addSpiritDrop = require('./death/addSpiritDrop')

module.exports = (instance, spirit, killer) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (spirit.drop.length > 0) {
        const dropTokens = await addSpiritDrop(spirit)
        await informNearbyPlayers(
          spirit.latitude,
          spirit.longitude,
          {
            command: 'map_coll_add',
            tokens: dropTokens,
          }
        )
      }

      await Promise.all([
        informNearbyPlayers(
          spirit.latitude,
          spirit.longitude,
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
        removeInstance('spirits', instance)
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
