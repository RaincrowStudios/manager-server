const timers = require('../../database/timers')
const portalSummon = require('./portalSummon')

module.exports = (portalInstance, portal) => {
  try {
    const currentTime = Date.now()

    const summonTimer =
      setTimeout(() =>
        portalSummon(portalInstance), portal.summonOn - currentTime
      )

    timers.insert({portalInstance, summonTimer})
    return true
  }
  catch (err) {
    console.error(err)
  }
}
