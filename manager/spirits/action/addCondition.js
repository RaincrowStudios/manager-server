const addObjectToHash = require('../../../redis/addObjectToHash')
const addToActiveSet = require('../../../redis/addToActiveSet')
const updateHashFieldObject = require('../../../redis/updateHashFieldObject')
const createInstanceId = require('../../../utils/createInstanceId')
const informNearbyPlayers = require('../../../utils/informNearbyPlayers')
const conditionAdd = require('../../conditions/conditionAdd')
const deleteCondition = require('../../conditions/deleteCondition')

module.exports = (caster, target, spell) => {
  const currentTime = Date.now()
  const update = []
  const inform = []
  let duration

  target.conditions = target.conditions ? target.conditions : []
  if (typeof spell.condition.duration === 'string') {
    if (spell.condition.duration.includes('-')) {
      const range = spell.condition.duration.split('-')
      const min = parseInt(range[0], 10)
      const max = parseInt(range[1], 10)
      duration = Math.floor(Math.random() * (max - min + 1)) + min
    }
    else {
      const parts = spell.condition.duration.split('*')
      const mod = parts[0]
      const subparts = parts[1].split(':')

      let property
      if (subparts[0] === 'caster') {
        property = caster
      }
      else if (subparts[0] === 'target') {
        property = target
      }

      duration =
        Math.round(parseFloat(mod) * parseFloat(property[subparts[1]]))
    }
  }
  else {
    duration = spell.condition.duration
  }

  duration = parseInt(duration, 10)

  const condition = {
    instance: createInstanceId(),
    id: spell.id,
    caster: caster.instance,
    bearer: target.instance,
    createdOn: currentTime,
    expiresOn: duration > 0 ? currentTime + (duration * 1000) : 0
  }

  if (spell.condition.overTime) {
    condition.overTime = spell.condition.overTime
  }

  if (spell.condition.onExpiration) {
    condition.onExpiration = spell.condition.onExpiration
  }

  if (spell.condition.hidden) {
    condition.hidden = spell.condition.hidden
  }

  if (spell.condition.tick) {
    condition.triggerOn = currentTime + (spell.condition.tick * 1000)
    condition.tick = spell.condition.tick
  }

  for (const modifier of spell.condition.modifiers) {
    for (const keyValue of Object.entries(modifier)) {
      if (keyValue[0] !== 'status' && typeof keyValue[1] === 'string') {
        const parts = keyValue[1].split('*')
        const mod = parts[0]
        const subparts = parts[1].split(':')

        let property
        if (subparts[0] === 'caster') {
          property = caster
        }
        else if (subparts[0] === 'target') {
          property = target
        }

        condition[keyValue[0]] = mod * property[subparts[1]]
      }
      else {
        condition[keyValue[0]] = keyValue[1]
      }
    }
  }

  const oldConditions = Object.values(target.conditions)
    .filter(condition => condition.id === spell.id)

  if (
    (oldConditions.length && !spell.condition.stackable) ||
    (spell.condition.stackable &&
      oldConditions.length >= spell.condition.stackable)
  ) {
    update.push(
      deleteCondition(oldConditions[0].instance),
      updateHashFieldObject(
        target.instance,
        'remove',
        'conditions',
        oldConditions[0].instance
      )
    )

    inform.push(
      {
        function: informNearbyPlayers,
        parameters: [
          target,
          {
            command: 'map_condition_remove',
            instance: oldConditions[0].instance
          },
          spell.condition.hidden ? 1 : 0
        ]
      }
    )
  }

  update.push(
    addObjectToHash(condition.instance, condition),
    addToActiveSet('conditions', condition.instance),
    conditionAdd(condition.instance, condition),
    updateHashFieldObject(
      target.instance,
      'add',
      'conditions',
      condition.instance,
      condition
    )
  )


  inform.push(
    {
      function: informNearbyPlayers,
      parameters: [
        target,
        {
          command: 'map_condition_add',
          bearerInstance: target.instance,
          conditionInstance: condition.instance,
          condition: condition.id
        },
        spell.condition.hidden ? 1 : 0
      ]
    }
  )

  return [update, inform]
}
