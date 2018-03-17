const timers = require('../../database/timers')
const getAllFromHash = require('../../redis/getAllFromHash')
const getOneFromHash = require('../../redis/getOneFromHash')
const removeFromActiveSet = require('../../redis/removeFromActiveSet')
const removeHash = require('../../redis/removeHash')
const updateHashFieldArray = require('../../redis/updateHashFieldArray')
const informPlayers = require('../../utils/informPlayers')

module.exports = async (instance) => {
  try {
    const bearer =
      await getAllFromHash('conditions', instance)
      
    if (bearer) {
      const conditions = await getOneFromHash(bearer.type, bearer.instance, 'conditions')

      if (conditions.length > 0) {
        let conditionToExpire, index
        for (let i = 0; i < conditions.length; i++) {
          if (conditions[i].instance === instance) {
            conditionToExpire = conditions[i]
            index = i
          }
        }

        await Promise.all([
          updateHashFieldArray(
            bearer.type,
            bearer.instance,
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
          bearer: bearer.instance
        })

        if (bearer.type !== 'spirit' && !conditionToExpire.hidden) {
          const player =
            await getOneFromHash(bearer.type, bearer.instance, 'player')
          await informPlayers(
            [player],
            {
              command: 'player_condition_remove',
              instance: instance
            }
          )
        }
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
