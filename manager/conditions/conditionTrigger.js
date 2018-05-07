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
      let [player, type, conditions] =
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
          const spell = await getOneFromHash('list:spells', conditionToUpdate.id)
          let [killerDisplayName, killerType, killerDegree] =
            await getFieldsFromHash(
              conditionToUpdate.caster, ['displayName', 'type', 'degree']
            )

          const newCondition = conditionToUpdate
          const total = resolveCondition(spell.condition, newCondition)
          const bearerNewEnergy = await adjustEnergy(bearerInstance, total)

          console.log({
            event: 'condition_triggered',
            player: player,
            character: bearerInstance,
            condition: spell.id,
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
                  command: 'character_condition_death',
                  killer: killerDisplayName,
                  type: killerType,
                  degree: killerDegree,
                  spell: spell.displayName
                }
              ),
              deleteCondition(conditionInstance)
            ])
          }
          else {
            let update = []
            if (type !== 'spirit') {
              update.push(
                informPlayers(
                  [player],
                  {
                    command: 'character_condition_trigger',
                    condition: conditionInstance,
                    spell: spell.displayName,
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
              currentTime + (newCondition.tick * 1000)

            const newTimer =
              setTimeout(() =>
                conditionTrigger(conditionInstance),
                newCondition.tick * 1000
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
