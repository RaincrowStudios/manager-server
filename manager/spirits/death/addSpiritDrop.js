const uuidv1 = require('uuid/v1')
const getOneFromList = require('../../../redis/getOneFromList')
const addToActiveSet = require('../../../redis/addToActiveSet')
const addToGeohash = require('../../../redis/addToGeohash')
const addObjectToHash = require('../../../redis/addObjectToHash')
const createMapToken = require('../../../utils/createMapToken')
const informNearbyPlayers = require('../../../utils/informNearbyPlayers')
const generateDropCoords = require('./generateDropCoords')

module.exports = (spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      const drops = spirit.drop ? spirit.drop : []
      if (spirit.carrying && spirit.carrying.length) {
        drops.push(...spirit.carrying)
      }

      if (drops.length) {
        const update = []

        const collectibles = await Promise.all(drops.map(drop => {
          const roll = Math.floor((Math.random() * 100) + 1)
          if (!drop.chance || roll <= drop.chance) {
            if (drop.id === 'silver') {
              return new Promise((resolve) => {
                resolve({type: 'silver', displayName: 'Silver Drach'})
              })
            }
            else {
              return getOneFromList('collectibles', drop.id)
            }
          }
        }))

        for (const collectible of collectibles) {
          if (collectible) {
            const instance = uuidv1()

            const coords = generateDropCoords(spirit.latitude, spirit.longitude)
            collectible.latitude = coords[0]
            collectible.longitude = coords[1]

            update.push(
              addObjectToHash(instance, collectible),
              addToActiveSet('collectibles', instance),
              addToGeohash('collectibles', instance, coords[0], coords[1]),
              informNearbyPlayers(
                spirit.latitude,
                spirit.longitude,
                {
                  command: 'map_collectible_drop',
                  spirit: spirit.instance,
                  token: createMapToken(instance, collectible),
                }
              )
            )
          }
        }

        await Promise.all(update)
      }

      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
