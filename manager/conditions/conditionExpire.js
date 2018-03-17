const timers = require('../../database/timers')
const getAllFromHash = require('../../redis/getAllFromHash')
const getOneFromHash = require('../../redis/getOneFromHash')
const removeFromActiveSet = require('../../redis/removeFromActiveSet')
const removeHash = require('../../redis/removeHash')
const updateHashFieldArray = require('../../redis/updateHashFieldArray')
const informPlayers = require('../../utils/informPlayers')

module.exports = async (instance) => {
  try {
    const bearerInstance =
      await getOneFromHash('conditions', instance, 'bearer')
    const bearer = await getAllFromHash('characters', bearerInstance)
    const category = bearer.type === 'spirit' ? 'spirits' : 'characters'

    if (bearer) {
      let conditionToExpire, index
      for (let i = 0; bearer.conditions.length; i++) {
        if (bearer.conditions[i].instance === instance) {
          conditionToExpire = bearer.conditions[i].instance
          index = i
        }
      }

      await Promise.all([
        updateHashFieldArray(
          category,
          bearerInstance,
          'remove',
          'conditions',
          conditionToExpire,
          index
        ),
        removeFromActiveSet('conditions', instance),
        removeHash('conditions', instance)
      ])

      console.log({
        event: 'condition_expire',
        instance,
        bearer: bearerInstance
      })

      if (bearer.type !== 'spirit' && !conditionToExpire.hidden) {
        await informPlayers(
          [bearer.player],
          {
            command: 'player_condition_remove',
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
