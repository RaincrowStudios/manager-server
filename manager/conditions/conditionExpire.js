const getOneFromHash = require('../../redis/getOneFromHash')
const getFieldsFromHash = require('../../redis/getFieldsFromHash')
const removeFromActiveSet = require('../../redis/removeFromActiveSet')
const removeHash = require('../../redis/removeHash')
const updateHashFieldArray = require('../../redis/updateHashFieldArray')
const informPlayers = require('../../utils/informPlayers')
const deleteCondition = require('./deleteCondition')

module.exports = async (conditionInstance) => {
  try {
    const bearerInstance =
      await getOneFromHash('list:conditions', conditionInstance)

    if (bearerInstance) {
      let player, type, conditions
      [player, type, conditions] =
        await getFieldsFromHash(bearerInstance, ['player', 'type', 'conditions'])

      if (conditions.length > 0) {
        let index
        const conditionToExpire = conditions.filter((condition, i) => {
          if (condition.instance === conditionInstance) {
            index = i
            return true
          }
        })[0]

        await Promise.all([
          updateHashFieldArray(
            bearerInstance,
            'remove',
            'conditions',
            conditionToExpire,
            index
          ),
          removeFromActiveSet('conditions', conditionInstance),
          removeHash('list:conditions', conditionInstance)
        ])

        console.log({
          event: 'condition_expire',
          condition: conditionInstance,
          bearer: bearerInstance
        })

        if (type !== 'spirit' && !conditionToExpire.hidden) {
          await deleteCondition(conditionInstance)
          await informPlayers(
            [player],
            {
              command: 'player_condition_remove',
              condition: conditionInstance
            }
          )
        }
      }
    }
    else {
      await deleteCondition(conditionInstance)
    }
  }
  catch (err) {
    console.error(err)
  }
}
