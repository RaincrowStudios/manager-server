const timers = require('../../database/timers')
const getSetFromRedis = require('../utils/getSetFromRedis')
const getAllFromRedis = require('../utils/getAllFromRedis')
const portalSpawn = require('../manager/portals/portalSpawn')
const portalExpire = require('../manager/portals/portalExpire')

async function initializePortals() {
  try {
    const portals = await getSetFromRedis('portals')
    if (portals !== []) {
      for (let i = portals.length - 1; i >= 0; i--) {
        const currentTime = Date.now()
        const portal = await getAllFromRedis(portals[i])

        if (portal.info.summonOn > currentTime && portal.info.ward > 0) {
          const summonTimer =
            setTimeout(portalSummon(portals[i], portal), portal.info.summonOn)

          timers.insert({
            portals[i],
            summonTimer
          })
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

module.exports = initializeSpirits
