const timers = require('../../database/timers')
const getAllFromHash = require('../../redis/getAllFromHash')
const removeFromAll = require('../../redis/removeFromAll')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')
const informPlayers = require('../../utils/informPlayers')
const deleteAllConditions = require('../conditions/deleteAllConditions')
const addSpiritDrop = require('./death/addSpiritDrop')

module.exports = (instance, killer) => {
  return new Promise(async (resolve, reject) => {
    try {
      const spirit = await getAllFromHash('spirits', instance)
      if (spirit) {
        if (spirit.drop.length > 0) {
          await addSpiritDrop(spirit)
        }

        await deleteAllConditions(spirit.conditions)

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
          removeFromAll('spirits', instance)
        ])

        console.log({
          event: 'spirit_death',
          spirit: instance,
          killer: killer,
          type: spirit.type,
          owner: spirit.ownerPlayer
        })
      }
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
