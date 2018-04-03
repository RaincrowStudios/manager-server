const timers = require('../../database/timers')
const getAllFromHash = require('../../redis/getAllFromHash')
const removeFromAll = require('../../redis/removeFromAll')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')
const informPlayers = require('../../utils/informPlayers')
const deleteAllConditions = require('../conditions/deleteAllConditions')

module.exports = async (spiritInstance) => {
  try {
    const spirit = await getAllFromHash(spiritInstance)

    if (spirit) {
      await deleteAllConditions(spirit.conditions)
      await Promise.all([
        informNearbyPlayers(
          spirit.latitude,
          spirit.longitude,
          {
            command: 'map_spirit_expire',
            instance: spiritInstance
          }
        ),
        informPlayers(
          [spirit.ownerPlayer],
          {
            command: 'player_spirit_expire',
            spirit: spiritInstance,
            displayName: spirit.displayName
          }
        ),
        removeFromAll('spirits', spiritInstance)
      ])
    }
    const spiritTimers = timers.by('instance', spiritInstance)
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
