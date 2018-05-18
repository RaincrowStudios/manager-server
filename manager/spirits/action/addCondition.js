const uuidv1 = require('uuid/v1')
const addEntriesToList = require('../../../redis/addEntriesToList')
const addToActiveSet = require('../../../redis/addToActiveSet')
const updateHashFieldArray = require('../../../redis/updateHashFieldArray')
const informNearbyPlayers = require('../../../utils/informNearbyPlayers')
const informPlayers = require('../../../utils/informPlayers')
const conditionAdd = require('../../conditions/conditionAdd')
const deleteCondition = require('../../conditions/deleteCondition')

module.exports = (caster, target, spell) => {
  return new Promise(async (resolve, reject) => {
    try {
      let duration
      const conditionInstance = uuidv1()
      const currentTime = Date.now()
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

      let result = {
        id: spell.id,
        displayName: spell.displayName,
        instance: conditionInstance,
        caster: caster.instance,
        createdOn: currentTime,
        expiresOn: duration > 0 ? currentTime + (duration * 1000) : 0
      }

      if (spell.condition.hidden) {
        result.hidden = spell.condition.hidden
      }

      if (spell.condition.tick) {
        result.triggerOn = currentTime + (spell.condition.tick * 1000)
        result.tick = spell.condition.tick
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

            result[keyValue[0]] = mod * property[subparts[1]]
          }
          else {
            result[keyValue[0]] = keyValue[1]
          }
        }
      }

      let indexes = []
      const oldCondition = target.conditions.filter((condition, i) => {
        if (condition.id === spell.id) {
          indexes.push(i)
          return true
        }
        else {
          return false
        }
      })

      if (
        (oldCondition.length && !spell.condition.stackable) ||
        (spell.condition.stackable &&
          oldCondition.length >= spell.condition.stackable)
      ) {
        await Promise.all([
          deleteCondition(oldCondition[0].instance),
          informPlayers(
            [target.player],
            {
              command: 'character_condition_remove',
              instance: result.instance
            }
          ),
          updateHashFieldArray(
            target.instance,
            'remove',
            'conditions',
            result,
            indexes[0]
          )
        ])
      }

      const update = [
        addEntriesToList(
          'conditions',
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
      ]

      if (!spell.condition.hidden) {
        if (target.type !== 'spirit') {
          update.push(
            informNearbyPlayers(
              target.fuzzyLatitude,
              target.fuzzyLongitude,
              {
                command: 'map_condition_add',
                instance: result.instance,
                spell: result.displayName
              },
              [target.player]
            ),
            informPlayers(
              [target.player],
              {
                command: 'character_condition_add',
                instance: result.instance,
                spell: result.displayName,
                caster: caster.displayName,
                expiresOn: result.expiresOn
              }
            )
          )
        }
        else {
          update.push(
            informNearbyPlayers(
              target.latitude,
              target.longitude,
              {
                command: 'map_condition_add',
                instance: result.instance,
                spell: result.displayName
              }
            )
          )
        }
      }

      await Promise.all(update)

      resolve(result.displayName)
    }
    catch (err) {
      reject(err)
    }
  })
}
