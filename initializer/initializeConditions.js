const timers = require('../database/timers')
const getSetFromRedis = require('../utils/getSetFromRedis')
const getAllFromRedis = require('../utils/getAllFromRedis')
const getFromRedis = require('../utils/getFromRedis')
const conditionExpire = require('../manager/conditions/conditionExpire')
const conditionTrigger = require('../manager/conditions/conditionTrigger')
const deleteCondition = require('../manager/conditions/deleteCondition')

async function initializeConditions() {
  try {
    const conditions = await getSetFromRedis('conditions')
    if (conditions !== []) {
      for (let i = conditions.length - 1; i >= 0; i--) {
        const currentTime = Date.now()
        const bearerName = await getFromRedis(conditions[i], 'bearer')
        const bearer = await getAllFromRedis(bearerName)

        if (bearer) {
          for (const condition of bearer.info.conditions) {
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

              timers.insert({
                instance: conditions[i],
                expireTimer,
                triggerTimer,
              })
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
