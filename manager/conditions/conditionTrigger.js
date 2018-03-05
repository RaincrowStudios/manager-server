const timers = require('../../database/timers')
const getAllFromRedis = require('../../utils/getAllFromRedis')
const updateRedis = require('../../utils/updateRedis')
const spiritDeath = require('../spirits/spiritDeath')
const conditionExpire = require('./conditionExpire')
const resolveCondition = require('./resolveCondition')
const deleteCondition = require('./deleteCondition')

async function conditionTrigger (instance, bearerName) {
  try {
    const currentTime = Date.now()
    const bearer = await getAllFromRedis(bearerName)
    if (bearer) {
      let conditionToUpdate
      for (let i = 0; i < bearer.info.conditions.length; i++) {
        if (instance === bearer.info.conditions[i].instance) {
          conditionToUpdate = bearer.info.conditions[i]
          bearer.info.conditions.splice(i, 1)
          bearer.mapSelection.conditions.splice(i, 1)
        }
      }
      if (!conditionToUpdate) {
        for (let i = 0; i < bearer.info.conditionsHidden.length; i++) {
          if (instance === bearer.info.conditionsHidden[i].instance) {
            conditionToUpdate = bearer.info.conditionsHidden[i]
            bearer.info.conditionsHidden.splice(i, 1)
          }
        }
      }

      if (conditionToUpdate) {
        const total = resolveCondition(conditionToUpdate)
        bearer.info.energy += total
        bearer.mapSelection.energy += total

        console.log({
          event: 'condition_triggered',
          bearer: bearerName,
          condition: conditionToUpdate.id,
          total: total,
          energy: bearer.info.energy
        })

        if (
          bearer.info.energy <= 0 &&
          (bearer.info.type === 'lesserSpirit' ||
          bearer.info.type === 'greaterSpirit')
        ) {
          spiritDeath(bearerName, bearer.info, conditionToUpdate.caster)
          conditionExpire(instance, bearerName)
        }
        else {
          conditionToUpdate.triggerOn = currentTime + (conditionToUpdate.tick * 60000)
          const newTimer =
            setTimeout(() =>
              conditionTrigger(instance, bearerName),
              conditionToUpdate.tick * 60000
            )

          await updateRedis(
            bearerName,
            ['info', 'mapSelection'],
            [bearer.info, bearer.mapSelection]
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
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = conditionTrigger
