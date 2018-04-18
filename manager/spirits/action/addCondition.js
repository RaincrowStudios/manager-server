const uuidv1 = require('uuid/v1')
const addFieldsToHash = require('../../../redis/addFieldsToHash')
const addToActiveSet = require('../../../redis/addToActiveSet')
const updateHashFieldArray = require('../../../redis/updateHashFieldArray')
const conditionAdd = require('../../conditions/conditionAdd')

module.exports = (caster, target, spell) => {
  return new Promise(async (resolve, reject) => {
    try {
      const conditionInstance = uuidv1()
      const currentTime = Date.now()

      let duration
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
          const subparts = parts[1].includes(':')

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

      let result = {
        instance: conditionInstance,
        id: spell.id,
        caster: caster.displayName,
        createdOn: currentTime,
        expiresOn: currentTime + (duration * 60000)
      }

      if (spell.condition.hidden) {
        result.hidden = spell.condition.hidden
      }

      if (spell.condition.tick) {
        result.triggerOn = currentTime + (spell.condition.tick * 60000)
        result.tick = spell.condition.tick
      }

      for (const keyValue of Object.entries(spell.condition.modifiers)) {
        if (keyValue[0] !== 'status' && typeof keyValue[1] === 'string') {
          const parts = keyValue[1].includes('*')
          const mod = parts[0]
          const subparts = parts[1].split(':')

          let property
          if (subparts[0] === 'caster') {
            property = caster
          }
          else if (subparts[0] === 'target') {
            property = target
          }

          result[keyValue[0]] =
            Math.round(parseFloat(mod) * parseFloat(property[subparts[1]]))
        }
        else {
          result[keyValue[0]] = keyValue[1]
        }
      }

      await Promise.all([
        addFieldsToHash(
          'list:conditions',
          [conditionInstance],
          [target.instance]
        ),
        addToActiveSet('conditions', conditionInstance),
        conditionAdd(conditionInstance, result),
        updateHashFieldArray(
          target.instance,
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
