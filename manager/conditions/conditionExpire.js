const checkKeyExistance = require('../../redis/checkKeyExistance')
const getOneFromHash = require('../../redis/getOneFromHash')
const getFieldsFromHash = require('../../redis/getFieldsFromHash')
const removeFromActiveSet = require('../../redis/removeFromActiveSet')
const removeHash = require('../../redis/removeHash')
const updateHashFieldArray = require('../../redis/updateHashFieldArray')
const informPlayers = require('../../utils/informPlayers')
const deleteCondition = require('./deleteCondition')

module.exports = async (conditionInstance) => {
  try {
    const bearer = await getOneFromHash(conditionInstance, 'bearer')
    const bearerExists = await checkKeyExistance(bearer)

    if (bearerExists) {
      const [player, type, conditions] = await getFieldsFromHash(
        bearer,
        ['player', 'type', 'conditions']
      )

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
            bearer,
            'remove',
            'conditions',
            conditionToExpire,
            index
          ),
          removeFromActiveSet('conditions', conditionInstance),
          removeHash(conditionInstance)
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
          bearer: bearer
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
