const timers = require('../../database/timers')
const getOneFromHash = require('../../redis/getOneFromHash')
const handleError = require('../../utils/handleError')
const collectibleExpire = require('./collectibleExpire')

module.exports = async collectibleInstance => {
  try {
    const timer = { instance: collectibleInstance }

    const currentTime = Date.now()

    const expiresOn =
      (await getOneFromHash(collectibleInstance, 'expiresOn')) ||
      currentTime + 24 * 60 * 60 * 1000

    const expireTimer = setTimeout(
      () => collectibleExpire(collectibleInstance),
      expiresOn - currentTime
    )

    timer.expireTimer = expireTimer

    timers.insert(timer)

    return true
  } catch (err) {
    return handleError(err)
  }
}
