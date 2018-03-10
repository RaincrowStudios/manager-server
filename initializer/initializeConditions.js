const timers = require('../database/timers')
const getSetFromRedis = require('../utils/getSetFromRedis')
const getInfoFromRedis = require('../utils/getInfoFromRedis')
const conditionExpire = require('../manager/conditions/conditionExpire')
const conditionTrigger = require('../manager/conditions/conditionTrigger')
const deleteCondition = require('../manager/conditions/deleteCondition')

async function initializeConditions() {
  try {
    const conditions = await getSetFromRedis('conditions')
    if (conditions !== []) {
      for (let i = conditions.length - 1; i >= 0; i--) {
        const currentTime = Date.now()
        const bearerName = await getInfoFromRedis(conditions[i])
        const bearer = await getInfoFromRedis(bearerName)

        if (bearer) {
          for (const condition of bearer.conditions) {
            if (condition.expiresOn > currentTime) {
              const expireTimer =
                setTimeout(() =>
                  conditionExpire(conditions[i], bearerName),
                  condition.expiresOn - currentTime
                )

              const triggerTimer =
                setTimeout(() =>
                  conditionTrigger(conditions[i], bearerName),
                  condition.triggerOn > currentTime ?
                    condition.triggerOn - currentTime : 0
                )

              const previousTimers = timers.by('instance', conditions[i])
              if (previousTimers) {
                previousTimers.expireTimer
                previousTimers.triggerTimer
                timers.update(previousTimers)
              }
              else {
                timers.insert({
                  instance: conditions[i],
                  expireTimer,
                  triggerTimer,
                })
              }
            }
            else {
              conditionExpire(conditions[i], bearerName)
            }
          }
        }
        else {
          deleteCondition(conditions[i])
        }
      }
    }
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = initializeConditions
