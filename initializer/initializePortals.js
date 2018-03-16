const timers = require('../../database/timers')
const getActiveSet = require('../redis/getActiveSet')
const getFieldsFromHash = require('../redis/getFieldsFromHash')
const portalSummon = require('../manager/portals/portalSummon')
const portalDelete = require('../manager/portals/portalDelete')

async function initializePortals() {
  try {
    const portals = await getActiveSet('portals')
    if (portals.length > 0) {
      for (let i = 0; i < portals.length; i++) {
        const currentTime = Date.now()
        const portal = await getFieldsFromHash(
          'portals',
          portals[i],
          ['energy', 'summonOn']
        )

        if (portal && portal.summonOn > currentTime && portal.energy > 0) {
          const summonTimer =
            setTimeout(() =>
              portalSummon(portals[i]),
              portal.summonOn > currentTime ?
                portal.summonOn - currentTime : 0
            )

          timers.insert({instance: portals[i], summonTimer})
        }
        else {
          portalDelete(portals[i], portal)
        }
      }
    }
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = initializePortals
