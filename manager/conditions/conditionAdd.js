const timers = require('../../database/timers')
const conditionTrigger = require('./conditionTrigger')

module.exports = async (instance, condition) => {
  try {
    const triggerTimer =
      setTimeout(conditionTrigger(instance, condition), condition.info.triggerOn)

    timers.insert({instance, triggerTimer})
  }
  catch (err) {
    console.error(err)
  }
}
