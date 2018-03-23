const timers = require('../../database/timers')
const getAllFromHash = require('../../redis/getAllFromHash')
const removeFromAll = require('../../redis/removeFromAll')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')
const informPlayers = require('../../utils/informPlayers')
const deleteAllConditions = require('../conditions/deleteAllConditions')

module.exports = async (instance) => {
  try {
    const spirit = await getAllFromHash('spirits', instance)

    if (spirit) {
      await deleteAllConditions(spirit.conditions)
      await Promise.all([
        informNearbyPlayers(
          spirit.latitude,
          spirit.longitude,
          {
            command: 'map_spirit_remove',
            instance: instance
          }
        ),
        informPlayers(
          [spirit.ownerPlayer],
          {
            command: 'player_spirit_expired',
            displayName: spirit.displayName,
            instance: instance
          }
        ),
        removeFromAll('spirits', instance)
      ])

      console.log({
        event: 'spirit_expired',
        spirit: instance,
        owner: spirit.ownerPlayer,
      })
    }
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
