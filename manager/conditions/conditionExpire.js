const timers = require('../../database/timers')
const getAllFromHash = require('../../redis/getAllFromHash')
const getOneFromHash = require('../../redis/getOneFromHash')
const removeFromActiveSet = require('../../redis/removeFromActiveSet')
const removeHash = require('../../redis/removeHash')
const updateHashFieldArray = require('../../redis/updateHashFieldArray')
const informPlayers = require('../../utils/informPlayers')
const deleteCondition = require('./deleteCondition')

module.exports = async (instance) => {
  try {
    const bearer =
      await getAllFromHash('conditions', instance)

    if (bearer) {
      const conditions = await getOneFromHash(bearer.category, bearer.instance, 'conditions')

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
            bearer.category,
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

        if (bearer.type === 'characters' && !conditionToExpire.hidden) {
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
    else {
      await deleteCondition(instance)
    }
  }
  catch (err) {
    console.error(err)
  }
}
