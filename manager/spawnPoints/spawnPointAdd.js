const timers = require('../../database/timers')
const getOneFromHash = require('../../redis/getOneFromHash')
const handleError = require('../../utils/handleError')
const spawnPointExpire = require('./spawnPointExpire')

module.exports = async (spawnPointInstance) => {
  try {
    const timer = {instance: spawnPointInstance}

    const expiresOn = await getOneFromHash(spawnPointInstance, 'expiresOn')

    const currentTime = Date.now()

    const expireTimer =
      setTimeout(() =>
        spawnPointExpire(spawnPointInstance),
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
