const getOneFromHash = require('../../redis/getOneFromHash')
const getFieldsFromHash = require('../../redis/getFieldsFromHash')
const removeFromActiveSet = require('../../redis/removeFromActiveSet')
const removeFromHash = require('../../redis/removeFromHash')
const updateHashFieldArray = require('../../redis/updateHashFieldArray')
const informPlayers = require('../../utils/informPlayers')
const deleteCondition = require('./deleteCondition')

module.exports = async (conditionInstance) => {
  try {
    const bearerInstance =
      await getOneFromHash('list:conditions', conditionInstance)

    if (bearerInstance) {
      let [player, type, conditions] =
        await getFieldsFromHash(bearerInstance, ['player', 'type', 'conditions'])

      if (conditions.length) {
        let index
        const conditionToExpire = conditions.filter((condition, i) => {
          if (condition.instance === conditionInstance) {
            index = i
            return true
          }
        })[0]

        const update = [
          updateHashFieldArray(
            bearerInstance,
            'remove',
            'conditions',
            conditionToExpire,
            index
          ),
          removeFromActiveSet('conditions', conditionInstance),
          removeFromHash('list:conditions', conditionInstance)
        ]

        if (type !== 'spirit' && !conditionToExpire.hidden) {
          update.push(
            deleteCondition(conditionInstance),
            informPlayers(
              [player],
              {
                command: 'character_condition_remove',
                condition: conditionInstance
              }
            )
          )
        }

        console.log({
          event: 'condition_expire',
          condition: conditionInstance,
          bearer: bearerInstance
        })

        await Promise.all(update)
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
