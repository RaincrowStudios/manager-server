const uuidv1 = require('uuid/v1')
const addFieldsToHash = require('../../../redis/addFieldsToHash')
const addToActiveSet = require('../../../redis/addToActiveSet')
const updateHashFieldArray = require('../../../redis/updateHashFieldArray')
const conditionAdd = require('../../conditions/conditionAdd')

module.exports = (casterInstance, caster, targetInstance, target, spell) => {
  return new Promise(async (resolve, reject) => {
    try {
      const conditionInstance = uuidv1()
      const currentTime = Date.now()

      let duration
      if (typeof spell.condition.duration === 'string') {
        if (spell.condition.duration.includes(':')) {
          const parts = spell.condition.duration.split(':')
          if (parts[1].includes('+')) {
            const subparts = parts[1].split('+')
            duration = parts[0][subparts[0]] + parseInt(subparts[1])
          }
          else if (parts[1].includes('*')) {
            const subparts = parts[1].split('*')
            duration =
              Math.round(parts[0][subparts[0]] * parseFloat(subparts[1]))
          }
          else {
            duration = parts[0][parts[1]]
          }
        }
        else {
          const range = spell.condition.duration.split('-')
          const min = parseInt(range[0], 10)
          const max = parseInt(range[1], 10)
          duration = Math.floor(Math.random() * (max - min + 1)) + min
        }
      }
      else {
        duration = spell.condition.duration
      }
      duration = parseInt(duration, 10)
      let result = {
        instance: conditionInstance,
        spell: spell.id,
        caster: caster.displayName,
        createdOn: currentTime,
        expiresOn: currentTime + (duration * 60000),
        hidden: spell.condition.hidden
      }

      if (spell.condition.tick) {
        result.triggerOn = currentTime + (spell.condition.tick * 60000)
        result.tick = spell.condition.tick
      }

      for (const modifier of spell.condition.modifiers) {
        for (const key of Object.keys(modifier)) {
          if (key !== 'status' && typeof modifier[key] === 'string') {
            const parts = modifier[key].split(':')
            let property
            if (parts[0] === 'caster') {
              property = caster
            }
            else if (parts[0] === 'target') {
              property = target
            }
            if (parts[1].includes('+')) {
              const subparts = parts[1].split('+')
              result[key] = property[subparts[0]] + parseInt(subparts[1])
            }
            else if (parts[1].includes('*')) {
              const subparts = parts[1].split('*')
              result[key] =
                Math.round(property[subparts[0]] * parseFloat(subparts[1]))
            }
            else {
              result[key] = property[parts[1]]
            }
          }
          else {
            result[key] = spell.condition[key]
          }
        }
      }

      await Promise.all([
        conditionAdd(conditionInstance, result),
        addFieldsToHash('list:conditions', [conditionInstance], [targetInstance]),
        addToActiveSet('conditions', conditionInstance),
        updateHashFieldArray(
          targetInstance,
          'add',
          'conditions',
          result
        )
      ])

      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
