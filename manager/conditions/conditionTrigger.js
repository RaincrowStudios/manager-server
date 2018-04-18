const timers = require('../../database/timers')
const adjustEnergy = require('../../redis/adjustEnergy')
const getOneFromHash = require('../../redis/getOneFromHash')
const getFieldsFromHash = require('../../redis/getFieldsFromHash')
const updateHashFieldArray = require('../../redis/updateHashFieldArray')
const informPlayers = require('../../utils/informPlayers')
const spiritDeath = require('../spirits/spiritDeath')
const resolveCondition = require('./resolveCondition')
const deleteCondition = require('./deleteCondition')

async function conditionTrigger (conditionInstance) {
  try {
    const currentTime = Date.now()
    const bearerInstance =
      await getOneFromHash('list:conditions', conditionInstance)

    if (bearerInstance) {
      let player, type, conditions
      [player, type, conditions] =
        await getFieldsFromHash(
          bearerInstance, ['player', 'type', 'conditions']
        )

      if (conditions.length) {
        let index
        const conditionToUpdate = conditions.filter((condition, i) => {
          if (condition.instance === conditionInstance) {
            index = i
            return true
          }
        })[0]

        if (conditionToUpdate) {
          let spellId, conditionIndex
          [spellId, conditionIndex] = conditionToUpdate.id.split('-')

          const spell = await getOneFromHash('list:spells', spellId)
          const newCondition = conditionToUpdate
          const total = resolveCondition(
            spell.conditions[conditionIndex],
            newCondition
          )
          const bearerNewEnergy = await adjustEnergy(bearerInstance, total)

          console.log({
            event: 'condition_triggered',
            player: player,
            character: bearerInstance,
            condition: newCondition.id,
            total: total,
          })

          if (bearerNewEnergy <= 0 && type === 'spirits') {
            await spiritDeath(bearerInstance, newCondition.caster)
          }
          else if (bearerNewEnergy <= 0) {
            await Promise.all([
              informPlayers(
                [player],
                {
                  command: 'player_death_condition',
                  condition: spell.displayName,
                  caster: newCondition.caster
                }
              ),
              deleteCondition(conditionInstance)
            ])
          }
          else {
            let update = []
            if (type !== 'spirits') {
              update.push(
                informPlayers(
                  [player],
                  {
                    command: 'player_condition_trigger',
                    condition: conditionInstance,
                    displayName: spell.displayName,
                    total: total,
                    energy: bearerNewEnergy
                  }
                )
              )
            }

            update.push(
              updateHashFieldArray(
                bearerInstance,
                'replace',
                'conditions',
                conditionToUpdate,
                index
              )
            )

            await Promise.all(update)

            newCondition.triggerOn =
              currentTime + (newCondition.tick * 60000)

            const newTimer =
              setTimeout(() =>
                conditionTrigger(conditionInstance),
                newCondition.tick * 60000
              )

            let conditionTimer = timers.by('instance', conditionInstance)
            if (conditionTimer) {
              conditionTimer.triggerTimer = newTimer
              timers.update(conditionTimer)
            }
          }
        }
        else {
          deleteCondition(conditionInstance)
        }
      }
      else {
        deleteCondition(conditionInstance)
      }
    }
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = conditionTrigger
