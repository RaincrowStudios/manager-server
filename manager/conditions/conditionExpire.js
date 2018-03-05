const timers = require('../../database/timers')
const getAllFromRedis = require('../../utils/getAllFromRedis')
const informPlayers = require('../../utils/informPlayers')
const removeFromSet = require('../../utils/removeFromSet')
const removeFromRedis = require('../../utils/removeFromRedis')
const updateRedis = require('../../utils/updateRedis')

module.exports = async (instance, bearerName) => {
  try {
    let bearer = await getAllFromRedis(bearerName)

    let hidden = true
    let informPlayer = true
    for (let i = 0; i < bearer.info.conditions.length; i++) {
      if (instance === bearer.info.conditions[i].instance) {
        bearer.info.conditions.splice(i, 1)
        bearer.mapSelection.conditions.splice(i, 1)
        hidden = false
      }
    }
    if (!hidden) {
      for (let i = 0; i < bearer.info.conditionsHidden.length; i++) {
        if (instance === bearer.info.conditionsHidden[i].instance) {
          bearer.info.conditionsHidden.splice(i, 1)
          informPlayer = false
        }
      }
    }

    await Promise.all([
      updateRedis(
        bearerName,
        ['info', 'mapSelection'],
        [bearer.info, bearer.mapSelection]
      ),
      removeFromSet('conditions', instance),
      removeFromRedis(instance)
    ])

    if (
      (bearer.info.type !== 'lesserSpirit' ||
      bearer.info.type !== 'greaterSpirit') &&
      informPlayer
    ) {
      await informPlayers(
        [bearer.info.owner],
        {
          command: 'condition_remove',
          instance: instance
        }
      )
    }

    const conditionTimers = timers.by('instance', instance)
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
