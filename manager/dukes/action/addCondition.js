const addObjectToHash = require('../../../../redis/addObjectToHash')
const addToActiveSet = require('../../../../redis/addToActiveSet')
const removeFromActiveSet = require('../../../../redis/removeFromActiveSet')
const removeHash = require('../../../../redis/removeHash')
const updateHashFieldObject = require('../../../../redis/updateHashFieldObject')
const createInstanceId = require('../../../../utils/createInstanceId')
const informManager = require('../../../../utils/informManager')
const informNearbyPlayers = require('../../../../utils/informNearbyPlayers')

module.exports = (caster, target, spell, ingredients) => {
  const currentTime = Date.now()
  const update = []
  const inform = []
  let duration = 0

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

  for (const ingredient of ingredients) {
    if (ingredient && ingredient.spell && ingredient.spell.duration) {
      duration += (ingredient.spell.duration * ingredient.count)
    }
  }

  duration = parseInt(duration, 10)

  const condition = {
    instance: createInstanceId(),
    id: spell.id,
    caster: caster.instance,
    bearer: target.instance,
    createdOn: currentTime,
    expiresOn: duration ? currentTime + (duration * 1000) : 0,
    baseSpell: spell.base || spell.id
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

  if (spell.condition.modifiers) {
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

          condition[keyValue[0]] = condition[keyValue[0]] ?
            condition[keyValue[0]] + (mod * property[subparts[1]]) :
            mod * property[subparts[1]]
        }
        else {
          condition[keyValue[0]] =  condition[keyValue[0]] ?
            condition[keyValue[0]] + keyValue[1] : keyValue[1]
        }
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
    let oldestCondition
    for (const oldCondition of oldConditions) {
      if (!oldestCondition) {
        oldestCondition = oldCondition
      }
      else if (oldCondition.createdOn > oldestCondition.createdOn) {
        oldestCondition = oldCondition
      }
    }

    update.push(
      informManager(
        {
          command: 'remove',
          instance: oldestCondition.instance,
        }
      ),
      removeFromActiveSet('conditions', oldestCondition.instance),
      removeHash(oldestCondition.instance),
      updateHashFieldObject(
        target.instance,
        'remove',
        'conditions',
        oldestCondition.instance
      )
    )

    delete target.conditions[oldestCondition.instance]

    inform.push(
      {
        function: informNearbyPlayers,
        parameters: [
          target,
          {
            command: 'map_condition_remove',
            condition: {
              bearer: target.instance,
              instance: oldestCondition.instance,
              status: oldestCondition.status || '',
            }
          },
          oldestCondition.hidden ? 1 : 0
        ]
      }
    )
  }

  update.push(
    addObjectToHash(condition.instance, condition),
    addToActiveSet('conditions', condition.instance),
    informManager(
      {
        command: 'add',
        type: 'condition',
        instance: condition.instance,
        condition: condition
      }
    ),
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
          bearer: target.instance,
          instance: condition.instance,
          id: condition.id,
          status: condition.status || '',
          baseSpell: spell.base || ''
        },
        spell.condition.hidden ? 1 : 0
      ]
    }
  )

  target.conditions[condition.instance] = condition

  return [update, inform]
}
