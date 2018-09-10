const getEntriesFromList = require('../../redis/getEntriesFromList')
const getNearbyFromGeohash = require('../../redis/getNearbyFromGeohash')
const getAllFromHash = require('../../redis/getAllFromHash')
const getOneFromHash = require('../../redis/getOneFromHash')
const updateHashFieldObject = require('../../redis/updateHashFieldObject')
const handleError = require('../../utils/handleError')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')
const informPlayers = require('../../utils/informPlayers')
const handleExpire = require('./components/handleExpire')
const deleteCondition = require('./deleteCondition')

module.exports = async (conditionInstance) => {
  try {
    const condition = await getAllFromHash(conditionInstance)
    const bearer = await getAllFromHash(condition.bearer)

    if (bearer) {
      const update = []
      const inform = []

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
                condition: {
                  bearer: condition.bearer,
                  instance: conditionInstance,
                  status: condition.status || '',
                }
              },
              condition.hidden ? 1 : 0
            ]
          }
        )
      }

      if (
        condition.status === 'truesight' &&
        !Object.value(bearer.conditions)
          .filter(condition => condition.status === 'truesight').length
      ) {
        const [displayRadius, displayCount] =
          await getEntriesFromList(
            'constants',
            ['displayRadius', 'displayCount']
          )

        const [nearCharacters, nearSpirits] = await Promise.all(
          getNearbyFromGeohash(
            'characters',
            bearer.latitude,
            bearer.longitude,
            displayRadius,
            displayCount
          ),
          getNearbyFromGeohash(
            'characters',
            bearer.latitude,
            bearer.longitude,
            displayRadius,
            displayCount
          )
        )

        const nearInstances = [...nearCharacters, ...nearSpirits]
          .filter(instance => instance !== bearer.instance)

        for (const instance of nearInstances) {
          const conditions = await getOneFromHash(instance, 'conditions')

          if (
            Object.values(conditions)
              .filter(condition => condition.status === 'invisible').length
          ) {
            inform.push(
              {
                function: informPlayers,
                parameters: [
                  [bearer.player],
                  {
                    command: 'map_token_remove',
                    instance: instance
                  }
                ]
              }
            )
          }
        }
      }

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
    return handleError(err)
  }
}
