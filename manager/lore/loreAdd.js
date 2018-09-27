const timers = require('../../database/timers')
const getFieldsFromHash = require('../../redis/getFieldsFromHash')
const handleError = require('../../utils/handleError')
const loreExpire = require('./loreExpire')
const loreReveal = require('./loreReveal')

module.exports = async (loreInstance) => {
  try {
    const timer = {instance: loreInstance}

    const {revealOn, expiresOn} = await getFieldsFromHash(
      loreInstance,
      ['revealOn', 'expiresOn']
    )

    const currentTime = Date.now()

    if (revealOn) {
      const revealTimer =
        setTimeout(() => loreReveal(loreInstance), revealOn - currentTime)

      timer.revealTimer = revealTimer
    }

    const expireTimer =
      setTimeout(() => loreExpire(loreInstance), expiresOn - currentTime)

    timer.expireTimer = expireTimer

    timers.insert(timer)
    return true
  }
  catch (err) {
    return handleError(err)
  }
}
