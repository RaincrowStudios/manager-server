const timers = require('../../database/timers')
const getInfoFromRedis = require('../../utils/getInfoFromRedis')
const informPlayers = require('../../utils/informPlayers')
const removeFromSet = require('../../utils/removeFromSet')
const removeFromRedis = require('../../utils/removeFromRedis')
const addToRedis = require('../../utils/addToRedis')

module.exports = async (instance, bearerName) => {
  try {
    let bearer = await getInfoFromRedis(bearerName)
    if (bearer) {
      let hidden = true
      let informPlayer = true
      for (let i = 0; i < bearer.conditions.length; i++) {
        if (instance === bearer.conditions[i].instance) {
          bearer.conditions.splice(i, 1)
          hidden = false
        }
      }
      if (!hidden) {
        for (let i = 0; i < bearer.conditionsHidden.length; i++) {
          if (instance === bearer.conditionsHidden[i].instance) {
            bearer.conditionsHidden.splice(i, 1)
            informPlayer = false
          }
        }
      }

      await Promise.all([
        addToRedis(bearerName, bearer),
        removeFromSet('conditions', instance),
        removeFromRedis(instance)
      ])

      console.log({
        event: 'condition_expire',
        instance,
        bearer: bearerName
      })

      if (
        (bearer.type !== 'lesserSpirit' ||
        bearer.type !== 'greaterSpirit') &&
        informPlayer
      ) {
        await informPlayers(
          [bearer.owner],
          {
            command: 'condition_remove',
            instance: instance
          }
        )
      }
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
