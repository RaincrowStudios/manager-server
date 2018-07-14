const timers = require('../../database/timers')
const getAllFromHash = require('../../redis/getAllFromHash')
const removeFromActiveSet = require('../../redis/removeFromActiveSet')
const removeHash= require('../../redis/removeHash')
const updateHashFieldArray = require('../../redis/updateHashFieldArray')
const createMapToken = require('../../utils/createMapToken')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')
const informPlayers = require('../../utils/informPlayers')

module.exports = async (instance) => {
  try {
    const condition = await getAllFromHash(instance)
    const character = await getAllFromHash(condition.bearer)

    const update = [
      informPlayers(
        [character.player],
        {
          command: 'character_condition_remove',
          instance: instance,
          condition: condition.id
        }
      ),
      removeFromActiveSet('conditions', instance),
      removeHash(instance),
      updateHashFieldArray(
        condition.bearer,
        'remove',
        'conditions',
        condition,
        character.conditions.map(condition => condition.instance).indexOf(instance)
      )
    ]

    if (condition.status === 'invisible') {
      informNearbyPlayers(
        character.fuzzyLatitude,
        character.fuzzyLongitude,
        {
          command: 'map_character_add',
          token: createMapToken(condition.bearer, character)
        }
      ),
      [condition.bearer]
    }

    await Promise.all(update)

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
