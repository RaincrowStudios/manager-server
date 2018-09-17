const timers = require('../../database/timers')
const getEntriesFromHash = require('../../redis/getEntriesFromHash')
const loreExpire = require('./loreExpire')
const loreReveal = require('./loreReveal')

module.exports = async (loreInstance) => {
  const timer = {instance: loreInstance}

  const [revealOn, expiresOn] = await getEntriesFromHash(loreInstance, ['revealOn', 'expiresOn'])

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
