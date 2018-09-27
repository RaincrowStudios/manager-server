const timers = require('../../database/timers')
const getFieldsFromHash = require('../../redis/getFieldsFromHash')
const handleError = require('../../utils/handleError')
const conditionExpire = require('./conditionExpire')
const conditionTrigger = require('./conditionTrigger')

module.exports = async (conditionInstance) => {
  try {
    const timer = {instance: conditionInstance}

    const {expiresOn, triggerOn} = await getFieldsFromHash(
      conditionInstance,
      ['expiresOn', 'triggerOn']
    )

    const currentTime = Date.now()

    if (expiresOn) {
      const expireTimer =
        setTimeout(() =>
          conditionExpire(conditionInstance),
          expiresOn - currentTime
        )

      timer.expireTimer = expireTimer
    }

    if (triggerOn) {
      const triggerTimer =
        setTimeout(() =>
          conditionTrigger(conditionInstance),
          triggerOn - currentTime
        )

      timer.triggerTimer = triggerTimer
    }

    timers.insert(timer)
    return true
  }
  catch (err) {
    return handleError(err)
  }
}
