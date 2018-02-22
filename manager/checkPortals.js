const constants = require('../constants/constants')
const getSetFromRedis = require('./components/getSetFromRedis')
const getFromRedis = require('./components/getFromRedis')

async function checkPortals() {
  try {
    const portals = await getSetFromRedis('portals')
    if (portals !== []) {
      for (let i = portals.length - 1; i >= 0; i--) {
        const portal = await getFromRedis(portals[i], 'info')
        if (portal.summonOn <= Date.now()) {
          await resolveSummonSpirit()

          await Promise.all([
            removeInstanceFromRedis(portals[i]),
            removeFromGeohash('Portals', portals[i]),
            removeFromSet('portals', portals[i])
          ])

          const nearCharacters = await getNearbyFromGeohashByPoint(
            'Characters',
            portal.latitude,
            portal.longitude,
            constants.radiusVisual
          )

          let playersToRemovePortal = nearCharacters.length !== 0 ?
            await Promise.all(
              nearCharacters.map(async (character) => {
                const characterInfo = await getFromRedis(character[0], 'info')
                return characterInfo.owner
              })
            ) : []

          portals.splice(i, 1)
          i--
        }
      }
    }
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = checkPortals
