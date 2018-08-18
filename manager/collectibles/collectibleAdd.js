const timers = require('../../database/timers')
const collectibleExpire = require('./collectibleExpire')

module.exports = (instance, collectible) => {
  const currentTime = Date.now()

  if (collectible.expiresOn) {
    const expireTimer =
      setTimeout(() =>
        collectibleExpire(instance),
        collectible.expiresOn - currentTime
      )

    timers.insert({instance, expireTimer})
  }

  return true
}
