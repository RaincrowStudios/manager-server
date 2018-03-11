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
      let hidden
      for (let i = 0; i < bearer.conditions.length; i++) {
        if (
          bearer.conditions[i] &&
          instance === bearer.conditions[i].instance
        ) {
          bearer.conditions.splice(i, 1)
          hidden = bearer.conditions[i].hidden
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

      if (bearer.type !== 'spirit' && !hidden) {
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
