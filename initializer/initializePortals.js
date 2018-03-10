const timers = require('../../database/timers')
const getSetFromRedis = require('../utils/getSetFromRedis')
const getInfoFromRedis = require('../utils/getInfoFromRedis')
const portalSummon = require('../manager/portals/portalSummon')
const portalExpire = require('../manager/portals/portalExpire')

async function initializePortals() {
  try {
    const portals = await getSetFromRedis('portals')
    if (portals !== []) {
      for (let i = 0; i < portals.length; i++) {
        const currentTime = Date.now()
        const portal = await getInfoFromRedis(portals[i])

        if (portal.summonOn > currentTime && portal.energy > 0) {
          const summonTimer =
            setTimeout(portalSummon(portals[i], portal), portal.summonOn)

          timers.insert({instance: portals[i], summonTimer})
        }
        else {
          portalExpire(portals[i], portal)
        }
      }
    }
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = initializePortals
