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
      const update = []
      const inform = []

      let activeSpirits
      if (instanceInfo.owner) {
        activeSpirits = await getOneFromHash(instanceInfo.owner, 'activeSpirits')
      }

      update.push(
        removeFromAll('spirits', spiritInstance)
      )

      if (instanceInfo.conditions) {
        update.push(deleteAllConditions(instanceInfo.conditions))
      }

      if (activeSpirits) {
        const index = activeSpirits.indexOf(spiritInstance)
        update.push[
          informPlayers(
            [instanceInfo.player],
            {
              command: 'character_spirit_expire',
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

      inform.push(
        {
          function: informNearbyPlayers,
          parameters: [
            instanceInfo,
            {
              command: 'map_token_remove',
              instance: spiritInstance
            }
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
