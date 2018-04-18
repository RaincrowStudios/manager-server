const timers = require('../database/timers')
const getActiveSet = require('../redis/getActiveSet')
const getOneFromHash = require('../redis/getOneFromHash')
const conditionExpire = require('../manager/conditions/conditionExpire')
const conditionTrigger = require('../manager/conditions/conditionTrigger')
const deleteCondition = require('../manager/conditions/deleteCondition')

async function initializeConditions() {
  try {
    const conditions = await getActiveSet('conditions')

    if (conditions.length > 0) {
      for (let i = 0; i < conditions.length; i++) {
        if (conditions[i]) {
          const currentTime = Date.now()
          const bearerInstance =
            await getOneFromHash('list:conditions', conditions[i])

          const conditionsArray =
            await getOneFromHash(bearerInstance, 'conditions')

          const condition = conditionsArray
            .filter(condition => condition.instance === conditions[i])[0]

          if (condition) {
            if (condition.expiresOn > currentTime) {
              const expireTimer =
                setTimeout(() =>
                  conditionExpire(conditions[i]),
                  condition.expiresOn - currentTime
                )

              const triggerTimer =
                setTimeout(() =>
                  conditionTrigger(conditions[i]),
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
              conditionExpire(conditions[i])
            }
          }
          else {
            deleteCondition(conditions[i])
          }
        }
      }
    }
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = initializeConditions
