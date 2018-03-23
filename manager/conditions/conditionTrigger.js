const timers = require('../../database/timers')
const adjustEnergy = require('../../redis/adjustEnergy')
const getAllFromHash = require('../../redis/getAllFromHash')
const getOneFromHash = require('../../redis/getOneFromHash')
const updateHashFieldArray = require('../../redis/updateHashFieldArray')
const informPlayers = require('../../utils/informPlayers')
const spiritDeath = require('../spirits/spiritDeath')
const conditionExpire = require('./conditionExpire')
const resolveCondition = require('./resolveCondition')
const deleteCondition = require('./deleteCondition')

async function conditionTrigger (instance) {
  try {
    const currentTime = Date.now()
    const bearer =
      await getAllFromHash('conditions', instance)
    if (bearer) {
      const conditions = await getOneFromHash(bearer.category, bearer.instance, 'conditions')

      if (conditions.length > 0) {
        let conditionToUpdate, index
        for (let i = 0; i < conditions.length; i++) {
          if (conditions[i].instance === instance) {
            conditionToUpdate = conditions[i]
            index = i
          }
        }

        if (conditionToUpdate) {
          const newCondition = conditionToUpdate
          const total = resolveCondition(newCondition)

          let bearerCurrentEnergy, bearerDead
          [bearerCurrentEnergy, bearerDead] =
            await adjustEnergy(bearer.category, bearer.instance, total)

          console.log({
            event: 'condition_triggered',
            bearer: bearer.instance,
            condition: newCondition.id,
            total: total,
            energy: bearerCurrentEnergy
          })

          if (bearerDead && bearer.category === 'spirits') {
            await Promise.all([
              spiritDeath(bearer.instance, newCondition.caster),
              conditionExpire(instance)
            ])
          }
          else if (bearerDead) {
            await Promise.all([
              informPlayers(
                [bearer.instance],
                {
                  command: 'player_death'
                }
              ),
              conditionExpire(instance)
            ])
          }
          else if (bearer.category !== 'spirits') {
            await Promise.all([
              informPlayers(
                [bearer.instance],
                {
                  command: 'player_condition_trigger',
                  condition: newCondition.id,
                  total: total,
                  energy: bearerCurrentEnergy
                }
              ),
              updateHashFieldArray(
                bearer.category,
                bearer.instance,
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
                conditionTrigger(instance),
                newCondition.tick * 60000
              )

            await updateHashFieldArray(
              bearer.category,
              bearer.instance,
              'replace',
              'conditions',
              conditionToUpdate,
              index
            )

            let conditionTimer = timers.by('instance', instance)
            if (conditionTimer) {
              conditionTimer.triggerTimer = newTimer
              timers.update(conditionTimer)
            }
          }
        }
        else {
          deleteCondition(instance)
        }
      }
      else {
        deleteCondition(instance)
      }
    }
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = conditionTrigger
