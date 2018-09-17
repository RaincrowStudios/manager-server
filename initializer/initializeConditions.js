const timers = require('../database/timers')
const getActiveSet = require('../redis/getActiveSet')
const addFieldToHash = require('../redis/addFieldToHash')
const getAllFromHash = require('../redis/getAllFromHash')
const removeFromAll = require('../redis/removeFromAll')
const conditionExpire = require('../manager/conditions/conditionExpire')
const conditionTrigger = require('../manager/conditions/conditionTrigger')

function initializeConditions(id, managers) {
  return new Promise(async (resolve, reject) => {
    try {
      const conditions = await getActiveSet('conditions')

      if (conditions.length) {
        for (let i = 0; i < conditions.length; i++) {
          const currentTime = Date.now()
          const condition = await getAllFromHash(conditions[i])

          if (!condition) {
            removeFromAll('conditions', conditions[i])
            continue
          }

          if (condition && !managers.includes(condition.manager)) {
            await addFieldToHash(conditions[i], 'manager', id)

            if (condition.expiresOn === 0 || condition.expiresOn > currentTime) {
              let expireTimer
              if (condition.expiresOn) {
                expireTimer =
                  setTimeout(() =>
                    conditionExpire(conditions[i]),
                    condition.expiresOn - currentTime
                  )
                }

              let triggerTimer
              if (condition.triggerOn) {
                triggerTimer =
                  setTimeout(() =>
                    conditionTrigger(conditions[i]),
                    condition.triggerOn > currentTime ?
                      condition.triggerOn - currentTime : 0
                  )
              }

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
      }
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}

module.exports = initializeConditions
