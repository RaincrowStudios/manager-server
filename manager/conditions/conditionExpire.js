const getAllFromHash = require('../../redis/getAllFromHash')
const getFieldsFromHash = require('../../redis/getFieldsFromHash')
const removeFromActiveSet = require('../../redis/removeFromActiveSet')
const removeHash = require('../../redis/removeHash')
const updateHashFieldArray = require('../../redis/updateHashFieldArray')
const informPlayers = require('../../utils/informPlayers')
const deleteCondition = require('./deleteCondition')

module.exports = async (instance) => {
  try {
    const bearer = await getAllFromHash('list:conditions', instance)

    if (bearer) {
      let player, type, conditions
      [player, type, conditions] =
        await getFieldsFromHash(bearer, ['player', 'type', 'conditions'])

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
            bearer,
            'remove',
            'conditions',
            conditionToExpire,
            index
          ),
          removeFromActiveSet('conditions', instance),
          removeHash('list:conditions', instance)
        ])

        console.log({
          event: 'condition_expire',
          condition: instance,
          bearer: bearer
        })

        if (type !== 'spirit' && !conditionToExpire.hidden) {
          await deleteCondition(instance)
          await informPlayers(
            [player],
            {
              command: 'player_condition_remove',
              condition: instance
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
