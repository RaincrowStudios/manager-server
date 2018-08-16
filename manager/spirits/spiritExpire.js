const timers = require('../../database/timers')
const getAllFromHash = require('../../redis/getAllFromHash')
const removeFromAll = require('../../redis/removeFromAll')
const updateHashFieldObject = require('../../redis/updateHashFieldObject')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')
const informPlayers = require('../../utils/informPlayers')
const deleteAllConditions = require('../conditions/deleteAllConditions')

module.exports = async (spiritInstance) => {
  try {
    const instanceInfo = await getAllFromHash(spiritInstance)

    if (instanceInfo) {
      const update = []
      const inform = []

      update.push(
        removeFromAll('spirits', spiritInstance)
      )

      if (instanceInfo.location) {
        update.push(
          updateHashFieldObject(
            instanceInfo.location,
            'remove',
            'spirits',
            spiritInstance
          )
        )
      }

      if (instanceInfo.conditions) {
        update.push(deleteAllConditions(instanceInfo.conditions))
      }

      if (instanceInfo.owner) {
        update.push[
          informPlayers(
            [instanceInfo.player],
            {
              command: 'character_spirit_expire',
              spirit: spiritInstance,
              displayName: instanceInfo.displayName
            }
          ),
          updateHashFieldObject(
            instanceInfo.owner,
            'remove',
            'activeSpirits',
            spiritInstance
          )
        ]
      }

      inform.push(
        {
          function: informNearbyPlayers,
          parameters: [
            instanceInfo,
            {
              command: 'map_token_remove',
              instance: spiritInstance
            },
            Object.values(instanceInfo.conditions)
              .filter(condition => condition.status === 'invisible').length ?
              1 : 0
          ]
        }
      )

      await Promise.all(update)

      for (const informObject of inform) {
        const informFunction = informObject.function
        await informFunction(...informObject.parameters)
      }
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
