const timers = require('../../database/timers')
const getAllFromHash = require('../../redis/getAllFromHash')
const removeFromActiveSet = require('../../redis/removeFromActiveSet')
const removeHash= require('../../redis/removeHash')
const updateHashFieldObject = require('../../redis/updateHashFieldObject')
const createMapToken = require('../../utils/createMapToken')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')

module.exports = async (instance) => {
  try {
    const condition = await getAllFromHash(instance)
    const character = await getAllFromHash(condition.bearer)

    const update = [
      removeFromActiveSet('conditions', instance),
      removeHash(instance),
      updateHashFieldObject(
        condition.bearer,
        'remove',
        'conditions',
        instance
      )
    ]

    const inform = [
      {
        function: informNearbyPlayers,
        parameters: [
          character,
          {
            command: 'map_condition_remove',
            bearerInstance: condition.bearer,
            conditionInstance: instance
          },
          condition.hidden ? 1 : 0
        ]
      }
    ]

    if (condition.status === 'invisible') {
      inform.unshift(
        {
          function: informNearbyPlayers,
          parameters: [
            character,
            {
              command: 'map_token_add',
              token: createMapToken(condition.bearer, character)
            },
            2,
            [condition.bearer]
          ]
        }
      )
    }

    await Promise.all(update)

    for (const informObject of inform) {
      const informFunction = informObject.function
      await informFunction(...informObject.parameters)
    }

    const conditionTimers =
      timers.by('instance', instance)
    if (conditionTimers) {
      clearTimeout(conditionTimers.expireTimer)
      clearTimeout(conditionTimers.triggerTimer)
      timers.remove(conditionTimers)
    }
  }
  catch (err) {
    console.error(err)
  }
}
