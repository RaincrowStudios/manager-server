const timers = require('../../database/timers')
const removeFromActiveSet = require('../../redis/removeFromActiveSet')
const removeFromList = require('../../redis/removeFromList')
const updateHashFieldArray = require('../../redis/updateHashFieldArray')
const createMapToken = require('../../utils/createMapToken')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')
const informPlayers = require('../../utils/informPlayers')

module.exports = async (target, index) => {
  try {
    const update = [
      informPlayers(
        [target.player],
        {
          command: 'character_condition_remove',
          condition: target.conditions[index].instance
        }
      ),
      removeFromActiveSet('conditions', target.conditions[index].instance),
      removeFromList('conditions', target.conditions[index].instance),
      updateHashFieldArray(
        target.instance,
        'remove',
        'conditions',
        target.conditions[index].instance,
        index
      )
    ]

    if (target.conditions[index].status === 'invisible') {
      informNearbyPlayers(
        target.fuzzyLatitude,
        target.fuzzyLongitude,
        {
          command: 'map_character_add',
          token: createMapToken(target.instance, target)
        }
      ),
      [target.instance]
    }

    await Promise.all(update)

    const conditionTimers =
      timers.by('instance', target.conditions[index].instance)
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
