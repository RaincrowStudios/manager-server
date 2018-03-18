const timers = require('../../database/timers')
const portalSummon = require('./portalSummon')

module.exports = (instance, portal) => {
  try {
    const currentTime = Date.now()

    const summonTimer =
      setTimeout(() =>
        portalSummon(instance), portal.summonOn - currentTime
      )

    console.log('portal added, summoning in %d seconds...', (portal.summonOn - currentTime) / 1000)

    timers.insert({instance, summonTimer})
  }
  catch (err) {
    console.error(err)
  }
}
