const timers = require('../../database/timers')
const getOneFromHash = require('../../redis/getOneFromHash')
const collectibleExpire = require('./collectibleExpire')

module.exports = async (collectibleInstance) => {
  const expiresOn = await getOneFromHash(collectibleInstance, 'expiresOn')

  const currentTime = Date.now()

  if (expiresOn) {
    const expireTimer =
      setTimeout(() =>
        collectibleExpire(collectibleInstance),
        expiresOn - currentTime
      )

    timers.insert({collectibleInstance, expireTimer})
  }

  return true
}
