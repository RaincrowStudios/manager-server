const constants = require('../constants/constants')
const getSetFromRedis = require('./components/getSetFromRedis')
const getFromRedis = require('./components/getFromRedis')
const getNearbyFromGeohashByPoint = require('./components/getNearbyFromGeohashByPoint')
const removeFromGeohash = require('./components/removeFromGeohash')
const removeFromSet = require('./components/removeFromSet')
const removeInstanceFromRedis = require('./components/removeInstanceFromRedis')

async function checkSpirits() {
  try {
    const spirits = await getSetFromRedis('spirits')
    if (spirits !== []) {
      for (let i = spirits.length - 1; i >= 0; i--) {
        const spirit = await getFromRedis(spirits[i], 'info')
        if (spirit.expiresOn <= Date.now()) {
          await Promise.all([
            removeFromGeohash('Spirits', spirits[i]),
            removeFromSet('spirits', spirits[i]),
            removeInstanceFromRedis(spirits[i])
          ])

          const nearCharacters = await getNearbyFromGeohashByPoint(
            'Characters',
            spirit.latitude,
            spirit.longitude,
            constants.radiusVisual
          )

          let playersToRemovePortal = nearCharacters.length !== 0 ?
            await Promise.all(
              nearCharacters.map(async (character) => {
                const characterInfo = await getFromRedis(character[0], 'info')
                return characterInfo.owner
              })
            ) : []

          spirits.splice(i, 1)
          i--
        }
        else {
          if (spirit.nextMove <= Date.now()) {
            await resolveSpiritMove()
          }
          if (spirit.nextAction <= Date.now()) {
            await resolveSpiritAction()
          }
        }
      }
    }
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = checkSpirits
