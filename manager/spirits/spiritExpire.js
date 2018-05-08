const timers = require('../../database/timers')
const getAllFromHash = require('../../redis/getAllFromHash')
const getOneFromHash = require('../../redis/getOneFromHash')
const removeFromAll = require('../../redis/removeFromAll')
const updateHashFieldArray = require('../../redis/updateHashFieldArray')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')
const informPlayers = require('../../utils/informPlayers')
const deleteAllConditions = require('../conditions/deleteAllConditions')

module.exports = async (spiritInstance) => {
  try {
    const instanceInfo = await getAllFromHash(spiritInstance)

    if (instanceInfo) {
      let activeSpirits
      if (instanceInfo.owner) {
        activeSpirits = await getOneFromHash(instanceInfo.owner, 'activeSpirits')
      }
      const update = [
        deleteAllConditions(instanceInfo.conditions),
        informNearbyPlayers(
          instanceInfo.latitude,
          instanceInfo.longitude,
          {
            command: 'map_spirit_expire',
            instance: spiritInstance
          }
        ),
        removeFromAll('spirits', spiritInstance),
      ]

      if (activeSpirits) {
        const index = activeSpirits.indexOf(spiritInstance)
        update.push[
          informPlayers(
            [instanceInfo.player],
            {
              command: 'player_spirit_expire',
              spirit: spiritInstance,
              displayName: instanceInfo.displayName
            }
          ),
          updateHashFieldArray(
            instanceInfo.owner,
            'remove',
            'activeSpirits',
            spiritInstance,
            index
          )
        ]
      }
      await Promise.all(update)
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
