const getAllFromHash = require('../../redis/getAllFromHash')
const updateHashFieldObject = require('../../redis/updateHashFieldObject')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')
const handleExpire = require('./components/handleExpire')
const deleteCondition = require('./deleteCondition')

module.exports = async (conditionInstance) => {
  try {
    const condition = await getAllFromHash(conditionInstance)
    const bearer = await getAllFromHash(condition.bearer)

    if (bearer) {
      const update = []
      const inform = []
      bearer.instance = condition.bearer

      const [interimUpdate, interimInform] = await handleExpire(bearer, condition)

      update.push(...interimUpdate)
      inform.push(...interimInform)

      update.push(
        updateHashFieldObject(
          bearer.instance,
          'remove',
          'conditions',
          conditionInstance
        ),
        deleteCondition(conditionInstance)
      )

      if (!condition.hidden) {
        inform.push(
          {
            function: informNearbyPlayers,
            parameters: [
              bearer,
              {
                command: 'map_condition_remove',
                instance: conditionInstance
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
    else {
      await deleteCondition(conditionInstance)
    }

    return true
  }
  catch (err) {
    console.error(err)
  }
}
