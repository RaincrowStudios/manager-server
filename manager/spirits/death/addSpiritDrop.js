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
      const drops = spirit.drop ? spirit.drop : []
      if (spirit.carrying && spirit.carrying.length) {
        drops.push(...spirit.carrying)
      }

      if (drops.length) {
        const update = []

        const collectibles = await Promise.all(drops.map(drop => {
          if (drop) {
            return new Promise((resolve) => {
              resolve({type: 'silver', displayName: 'Silver Drach'})
            })
          }
          else {
            return getOneFromHash('list:collectibles', drop.id)
          }
        }))

        for (const collectible of collectibles) {
          if (collectible) {
            const instance = uuidv1()
            let count
            if (collectible.range) {
              if (collectible.range.includes('-')) {
                const range = collectible.range.split('-')
                const min = parseInt(range[0], 10)
                const max = parseInt(range[1], 10)
                count = Math.floor(Math.random() * (max - min + 1)) + min
              }
              else {
                count = parseInt(collectible.range, 10)
              }
            }
            else {
              count = 1
            }

            const coords = generateDropCoords(spirit.latitude, spirit.longitude)
            collectible.latitude = coords[0]
            collectible.longitude = coords[1]
            collectible.range = '1-1'

            for (let i = 1; i <= count; i++) {
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
