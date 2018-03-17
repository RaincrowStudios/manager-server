const uuidv1 = require('uuid/v1')
const getOneFromHash = require('../../../redis/getOneFromHash')
const addToActiveSet = require('../../../redis/addToActiveSet')
const addToGeohash = require('../../../redis/addToGeohash')
const addObjectToHash = require('../../../redis/addObjectToHash')
const createMapToken = require('../../../utils/createMapToken')
const informNearbyPlayers = require('../../../utils/informNearbyPlayers')
const generateDropCoords = require('./generateDropCoords')

module.exports = (spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (spirit.drop[0] === 'carried') {
        spirit.drop = spirit.carrying
      }

      if (spirit.drop.length > 0) {
        const collectibles = spirit.drop.map(async drop => {
          const instance = uuidv1()
          const range = drop.range.split('-')
          const min = parseInt(range[0], 10)
          const max = parseInt(range[1], 10)
          const count = Math.floor(Math.random() * (max - min + 1)) + min
          const coords = generateDropCoords(spirit.latitude, spirit.longitude)

          let collectible
          if (drop === 'silver') {
            collectible = {
              type: 'silver',
              displayName: 'Silver',
            }
          }
          else {
            collectible = await getOneFromHash('collectibles', 'all', drop.id)
          }
          collectible.instance = instance
          collectible.latitude = coords[0]
          collectible.longitude = coords[1]
          collectible.range = '1-1'

          const tokens = []
          for (let i = 1; i <= count; i++) {
            tokens.push(createMapToken(collectible))
            await Promise.all([
              addObjectToHash('collectibles', instance, collectible),
              addToActiveSet('collectibles', instance),
              addToGeohash('collectibles', instance, coords[0], coords[1])
            ])
          }
          return tokens
        })

        let dropTokens = []

        for (const array of collectibles) {
          dropTokens.push(...array)
        }

        await informNearbyPlayers(
          spirit.latitude,
          spirit.longitude,
          {
            command: 'map_collectible_add',
            tokens: dropTokens,
          }
        )

        resolve(true)
      }
    }
    catch (err) {
      reject(err)
    }
  })
}
