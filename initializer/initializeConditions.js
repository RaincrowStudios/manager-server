const timers = require('../database/timers')
const getActiveSet = require('../redis/getActiveSet')
const getOneFromHash = require('../redis/getOneFromHash')
const getOneFromList = require('../redis/getOneFromList')
const conditionExpire = require('../manager/conditions/conditionExpire')
const conditionTrigger = require('../manager/conditions/conditionTrigger')
const deleteCondition = require('../manager/conditions/deleteCondition')

function initializeConditions(id, managers) {
  return new Promise(async (resolve, reject) => {
    try {
      const conditions = await getActiveSet('conditions')

      if (conditions.length) {
        for (let i = 0; i < conditions.length; i++) {
          const currentTime = Date.now()
          const bearerInstance =
            await getOneFromList('conditions', conditions[i])

          if (!bearerInstance) {
            deleteCondition(conditions[i])
            continue
          }

          const conditionsArray =
            await getOneFromHash(bearerInstance, 'conditions')

          const condition = conditionsArray
            .filter(condition => condition.instance === conditions[i])[0]

          if (!condition) {
            deleteCondition(conditions[i])
            continue
          }

          if (condition.expiresOn === 0 || condition.expiresOn > currentTime) {
            let expireTimer
            if (condition.expiresOn) {
              expireTimer =
                setTimeout(() =>
                  conditionExpire(conditions[i]),
                  condition.expiresOn - currentTime
                )
              }

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
            continue
          }
        }
      }
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}

module.exports = initializeConditions
