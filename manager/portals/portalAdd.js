const timers = require('../../database/timers')
const portalSummon = require('./portalSummon')

module.exports = (instance, portal) => {
  try {
    const summonTimer =
      setTimeout(portalSummon(instance, portal), portal.info.summonOn)

    timers.insert({instance, summonTimer})
  }
  catch (err) {
    console.error(err)
  }
}
