const timers = require('../../database/timers')
const portalSummon = require('./portalSummon')

module.exports = (portalInstance, portal) => {
  try {
    const currentTime = Date.now()

    const summonTimer =
      setTimeout(() =>
        portalSummon(portalInstance), portal.summonOn - currentTime
      )

    console.log('portal added, summoning in %d seconds...', (portal.summonOn - currentTime) / 1000)
    timers.insert({portalInstance, summonTimer})
  }
  catch (err) {
    console.error(err)
  }
}
