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

      if (conditions.length > 0) {
        let conditionToUpdate, index
        for (let i = 0; i < conditions.length; i++) {
          if (conditions[i].instance === conditionInstance) {
            conditionToUpdate = conditions[i]
            index = i
          }
        }

        if (conditionToUpdate) {
          const spell =
            await getOneFromHash('list:spells', conditionToUpdate.spell)
          const newCondition = conditionToUpdate
          const total = resolveCondition(spell, newCondition)

          let bearerCurrentEnergy, bearerDead
          [bearerCurrentEnergy, bearerDead] =
            await adjustEnergy(bearerInstance, total)

          console.log({
            event: 'condition_triggered',
            player: player,
            character: bearerInstance,
            condition: newCondition.spell,
            total: total,
          })

          if (bearerDead && type === 'spirits') {
            await spiritDeath(bearerInstance, newCondition.caster)
          }
          else if (bearerDead) {
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
          else if (type !== 'spirits') {
            await Promise.all([
              informPlayers(
                [bearerInstance],
                {
                  command: 'player_condition_trigger',
                  condition: newCondition.spell,
                  total: total,
                  energy: bearerCurrentEnergy
                }
              ),
              updateHashFieldArray(
                bearerInstance,
                'replace',
                'conditions',
                conditionToUpdate,
                index
              )
            ])
          }
          else {
            newCondition.triggerOn =
              currentTime + (newCondition.tick * 60000)

            const newTimer =
              setTimeout(() =>
                conditionTrigger(conditionInstance),
                newCondition.tick * 60000
              )

            await updateHashFieldArray(
              bearerInstance,
              'replace',
              'conditions',
              conditionToUpdate,
              index
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
