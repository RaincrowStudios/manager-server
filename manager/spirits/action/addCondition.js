const uuidv1 = require('uuid/v1')
const conditionAdd = require('../../conditions/conditionAdd')

module.exports = (casterName, caster, action, spell, condition, target) => {
  const instance = uuidv1()
  const currentTime = Date.now()

  let result = {
    instance: instance,
    id: action,
    displayName: spell.displayName,
    caster: casterName,
    createdOn: currentTime,
    range: condition.overTime,
    onExpiration: condition.onExpiration,
    onDispel: condition.onDispel,
    dispellable: condition.dispellable
  }

  let duration
  if (typeof condition.duration === 'string') {
    const parts = condition.duration.split(':')
    const source = parts[0] === 'caster' ? caster : target
    if (parts[1].includes('+')) {
      const subparts = parts[1].split('+')
      duration = source[subparts[0]] + parseInt(subparts[1])
    }
    else if (parts[1].includes('*')) {
      const subparts = parts[1].split('*')
      duration =
        Math.round(source[subparts[0]] * parseFloat(subparts[1]))
    }
    else {
      duration = source[parts[1]]
    }
  }
  else {
    duration = condition.duration
  }

  result.expiresOn = currentTime + (duration * 60000)

  if (condition.tick) {
    result.triggerOn = currentTime + (condition.tick * 60000)
    result.tick = condition.tick
  }

  for (const modifier of condition.modifiers) {
    for (const key of Object.keys(modifier)) {
      if (key !== 'status' && typeof modifier[key] === 'string') {
        const parts = modifier[key].split(':')
        const source = parts[0] === 'caster' ? caster : target
        if (parts[1].includes('+')) {
          const subparts = parts[1].split('+')
          result[key] = source[subparts[0]] + parseInt(subparts[1])
        }
        else if (parts[1].includes('*')) {
          const subparts = parts[1].split('*')
          result[key] =
            Math.round(source[subparts[0]] * parseFloat(subparts[1]))
        }
        else {
          result[key] = source[parts[1]]
        }
      }
      else {
        result[key] = condition[key]
      }
    }
  }
  conditionAdd(instance, target.instance, result)
  return result
}
