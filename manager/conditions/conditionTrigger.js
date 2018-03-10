const timers = require('../../database/timers')
const getInfoFromRedis = require('../../utils/getInfoFromRedis')
const addToRedis = require('../../utils/addToRedis')
const spiritDeath = require('../spirits/spiritDeath')
const conditionExpire = require('./conditionExpire')
const resolveCondition = require('./resolveCondition')
const deleteCondition = require('./deleteCondition')

async function conditionTrigger (instance, bearerName) {
  try {
    const currentTime = Date.now()
    const bearer = await getInfoFromRedis(bearerName)
    if (bearer) {
      let conditionToUpdate
      for (let i = 0; i < bearer.conditions.length; i++) {
        if (instance === bearer.conditions[i].instance) {
          conditionToUpdate = bearer.conditions[i]
          bearer.conditions.splice(i, 1)
        }
      }
      if (!conditionToUpdate) {
        for (let i = 0; i < bearer.conditionsHidden.length; i++) {
          if (instance === bearer.conditionsHidden[i].instance) {
            conditionToUpdate = bearer.conditionsHidden[i]
            bearer.conditionsHidden.splice(i, 1)
          }
        }
      }

      if (conditionToUpdate) {
        const total = resolveCondition(conditionToUpdate)
        bearer.energy += total

        console.log({
          event: 'condition_triggered',
          bearer: bearerName,
          condition: conditionToUpdate.id,
          total: total,
          energy: bearer.energy
        })

        if (
          bearer.energy <= 0 &&
          (bearer.type === 'lesserSpirit' ||
          bearer.type === 'greaterSpirit')
        ) {
          spiritDeath(bearerName, bearer.info, conditionToUpdate.caster)
          conditionExpire(instance, bearerName)
        }
        else {
          conditionToUpdate.triggerOn =
            currentTime + (conditionToUpdate.tick * 60000)
          const newTimer =
            setTimeout(() =>
              conditionTrigger(instance, bearerName),
              conditionToUpdate.tick * 60000
            )

          await addToRedis(bearerName, bearer)

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
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = conditionTrigger
