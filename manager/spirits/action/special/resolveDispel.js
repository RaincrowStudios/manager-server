const getEntriesFromList = require('../../../../redis/getEntriesFromList')
const getNearbyFromGeohash = require('../../../../redis/getNearbyFromGeohash')
const getOneFromHash = require('../../../../redis/getOneFromHash')
const updateHashFieldObject = require('../../../../redis/updateHashFieldObject')
const createMapToken = require('../../../../utils/createMapToken')
const informNearbyPlayers = require('../../../../utils/informNearbyPlayers')
const informPlayers = require('../../../../utils/informPlayers')
const deleteCondition = require('../../../conditions/deleteCondition')

module.exports = async (target, spell) => {
  const total = 0
  const update = []
  const inform = []

  if (target.conditions && Object.values(target.conditions).length) {
    const dispellableConditions = Object.values(target.conditions)
      .filter(condition => !condition.undispellable)

    if (dispellableConditions.length) {
      let remainingConditions = [...dispellableConditions]

      remainingConditions.push(
        ...Object.values(target.conditions)
          .filter(condition => condition.undispellable)
      )

      let dispellLength = 1
      if (spell.id === 'spell_greaterDispel') {
        dispellLength = dispellableConditions.length
      }

      let wasInvisible, hadTruesight = false
      for (let i = 0; i < dispellLength; i++) {
        const index = spell.id === 'spell_greaterDispel' ?
          i : Math.floor(Math.random() * dispellableConditions.length)

        update.push(
          deleteCondition(dispellableConditions[index].instance),
          updateHashFieldObject(
            target.instance,
            'remove',
            'conditions',
            dispellableConditions[index].instance
          )
        )

        inform.push(
          {
            function: informNearbyPlayers,
            parameters: [
              target,
              {
                command: 'map_condition_remove',
                instance: target.instance,
                conditionInstance: dispellableConditions[index].instance,
                status: dispellableConditions[index].status || ''
              }
            ]
          }
        )

        if (dispellableConditions[i].status === 'invisible') {
          wasInvisible = true
        }

        if (dispellableConditions[i].status === 'truesight') {
          hadTruesight = true
        }

        remainingConditions = remainingConditions.splice(i, 1)
      }

      if (
        wasInvisible &&
        !remainingConditions
          .filter(condition => condition.status === 'invisible').length
      ) {
        inform.unshift(
          {
            function: informNearbyPlayers,
            parameters: [
              target,
              {
                command: 'map_token_add',
                token: createMapToken(target.instance, target)
              },
              2,
              [target.instance]
            ]
          }
        )
      }

      if (
        hadTruesight &&
        !remainingConditions
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
            target.latitude,
            target.longitude,
            displayRadius,
            displayCount
          ),
          getNearbyFromGeohash(
            'characters',
            target.latitude,
            target.longitude,
            displayRadius,
            displayCount
          )
        )

        const nearInstances = [...nearCharacters, ...nearSpirits]
          .filter(instance => instance !== target.instance)

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
                  [target.player],
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
    }
  }

  return [total, update, inform]
}
