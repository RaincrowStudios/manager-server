const timers = require('../database/timers')
const addFieldToHash = require('../redis/addFieldToHash')
const getActiveSet = require('../redis/getActiveSet')
const getAllFromHash = require('../redis/getAllFromHash')
const portalSummon = require('../manager/portals/portalSummon')
const portalDelete = require('../manager/portals/portalDelete')

async function initializePortals(id, managers) {
  return new Promise(async (resolve, reject) => {
    try {
      const portals = await getActiveSet('portals')

      if (portals.length) {
        for (let i = 0; i < portals.length; i++) {
          const currentTime = Date.now()
          const portal = await getAllFromHash(portals[i])

          if (!managers.includes(portal.manager)) {
            await addFieldToHash(portals[i], 'manager', id)

            if (portal && portal.energy > 0) {
              const summonTimer =
                setTimeout(() =>
                  portalSummon(portals[i]),
                  portal.summonOn > currentTime ?
                    portal.summonOn - currentTime : 0
                )

              timers.insert({instance: portals[i], summonTimer})
            }
            else {
              portalDelete(portals[i])
            }
          }
        }
      }
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}

module.exports = initializePortals
