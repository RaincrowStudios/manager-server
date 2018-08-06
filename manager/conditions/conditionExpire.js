const checkKeyExistance = require('../../redis/checkKeyExistance')
const getAllFromHash = require('../../redis/getAllFromHash')
const updateHashFieldArray = require('../../redis/updateHashFieldArray')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')
const handleExpire = require('./components/handleExpire')
const deleteCondition = require('./deleteCondition')

module.exports = async (conditionInstance) => {
  try {
    const condition = await getAllFromHash(conditionInstance)
    const bearerExists = await checkKeyExistance(condition.bearer)

    if (bearerExists) {
      const update = []
      const inform = []

      const bearer = await getAllFromHash(condition.bearer)
      bearer.instance = condition.bearer
      console.log(bearer.conditions)
      if (bearer.conditions.length) {
        let index
        const conditionToExpire = bearer.conditions.filter((condition, i) => {
          if (condition.instance === conditionInstance) {
            index = i
            return true
          }
        })[0]

        const [interimUpdate, interimInform] = await handleExpire(bearer, condition)

        update.push(...interimUpdate)
        inform.push(...interimInform)

        update.push(
          updateHashFieldArray(
            bearer.instance,
            'remove',
            'conditions',
            conditionToExpire,
            index
          ),
          deleteCondition(conditionInstance)
        )

        if (!conditionToExpire.hidden) {
          inform.push(
            {
              function: informNearbyPlayers,
              parameters: [
                bearer,
                {
                  command: 'map_condition_remove',
                  conditionInstance: conditionInstance,
                  bearerInstance: condition.bearer
                }
              ]
            }
          )
        }

        console.log({
          event: 'condition_expire',
          condition: conditionInstance,
          bearer: bearer.instance
        })

        await Promise.all(update)

        for (const informObject of inform) {
          const informFunction = informObject.function
          await informFunction(...informObject.parameters)
        }
      }
    }
    else {
      await deleteCondition(conditionInstance)
    }

    return true
  }
  catch (err) {
    console.error(err)
  }
}
