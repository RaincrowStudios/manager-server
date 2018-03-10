const uuidv1 = require('uuid/v1')
const addToRedis = require('../../../utils/addToRedis')
const addToSet = require('../../../utils/addToSet')
const conditionAdd = require('../../conditions/conditionAdd')

module.exports = (casterName, caster, targetInstance, target, spell) => {
  return new Promise(async (resolve, reject) => {
    try {
      const instance = uuidv1()
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

      let result = {
        instance: instance,
        id: spell.id,
        spell: spell.displayName,
        caster: casterName,
        createdOn: currentTime,
        expiresOn: currentTime + (duration * 60000),
        overTime: spell.condition.overTime,
        onExpiration: spell.condition.onExpiration,
        onDispel: spell.condition.onDispel,
        dispellable: spell.condition.dispellable,
        hidden: spell.condition.hidden
      }

      if (spell.condition.tick) {
        result.triggerOn = currentTime + (spell.condition.tick * 60000)
        result.tick = spell.condition.tick
      }

      for (const key of Object.keys(spell.condition)) {
        if (key !== 'status' && typeof spell.condition[key] === 'string') {
          const parts = spell.condition[key].split(':')
          if (parts[1].includes('+')) {
            const subparts = parts[1].split('+')
            result[key] = parts[0][subparts[0]] + parseInt(subparts[1])
          }
          else if (parts[1].includes('*')) {
            const subparts = parts[1].split('*')
            result[key] =
              Math.round(parts[0][subparts[0]] * parseFloat(subparts[1]))
          }
          else {
            result[key] = parts[0][parts[1]]
          }
        }
        else {
          result[key] = spell.condition[key]
        }
      }
      await Promise.all([
        addToRedis(instance, targetInstance),
        addToSet('conditions', instance)
      ])
      conditionAdd(instance, targetInstance, result)
      reject(result)
    }
    catch (err) {
      resolve(err)
    }
  })
}
