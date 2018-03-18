const timers = require('../../database/timers')
const riftSummon = require('./riftSummon')

module.exports = (instance, rift) => {
  try {
    const currentTime = Date.now()

    const expireTimer =
      setTimeout(() =>
        riftSummon(instance), rift.expiresOn - currentTime
      )

    const summonTimer =
      setTimeout(() =>
        riftSummon(instance), rift.summonOn - currentTime
      )

    timers.insert({instance, expireTimer, summonTimer})
  }
  catch (err) {
    console.error(err)
  }
}
