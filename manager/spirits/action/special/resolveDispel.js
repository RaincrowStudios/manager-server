const createMapToken = require('../../../../utils/createMapToken')
const updateHashFieldObject = require('../../../../redis/updateHashFieldObject')
const informNearbyPlayers = require('../../../../utils/informNearbyPlayers')
const deleteCondition = require('../../../conditions/deleteCondition')

module.exports = (caster, target, spell) => {
  const total = 0
  const update = []
  const inform = []

  if (target.conditions && Object.values(target.conditions).length) {
    const dispellableConditions =
      Object.values(target.conditions).filter(condition => !condition.undispellable)

    let dispellLength = 1
    if (spell.id === 'spell_greaterDispel') {
      dispellLength = dispellableConditions.length
    }

    for (let i = 0; i < dispellLength; i++) {
      const index = spell.id === 'spell_greaterDispel' ?
        i :
        Math.floor(Math.random() * dispellableConditions.length)

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
              instance: dispellableConditions[index].instance
            }
          ]
        }
      )

      if (dispellableConditions[i].status === 'invisible') {
        inform.push(
          {
            function: informNearbyPlayers,
            parameters: [
              target,
              {
                command: 'map_token_add',
                token: createMapToken(target.instance, target)
              },
              [target.instance]
            ]
          }
        )
      }
    }
  }

  return [total, update, inform]
}
