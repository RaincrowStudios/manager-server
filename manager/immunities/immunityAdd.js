const timers = require('../../database/timers')
const getOneFromHash = require('../../redis/getOneFromHash')
const handleError = require('../../utils/handleError')
const immunityExpire = require('./immunityExpire')

module.exports = async (immunityInstance) => {
  try {
    const timer = {instance: immunityInstance}

    const expiresOn = await getOneFromHash(immunityInstance, 'expiresOn')

    const currentTime = Date.now()

    const expireTimer =
      setTimeout(() =>
        immunityExpire(immunityInstance),
        expiresOn - currentTime
      )

    timer.expireTimer = expireTimer

    timers.insert(timer)
    return true
  }
  catch (err) {
    return handleError(err)
  }
}
