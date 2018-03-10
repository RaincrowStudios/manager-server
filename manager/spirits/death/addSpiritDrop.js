const uuidv1 = require('uuid/v1')
const getEntities = require('../../../datastore/getEntities')
const addToGeohash = require('../../../utils/addToGeohash')
const addToRedis = require('../../../utils/addToRedis')
const addToSet = require('../../../utils/addToSet')
const createMapToken = require('../../../utils/createMapToken')
const generateDropCoords = require('./generateDropCoords')

module.exports = (spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      let query = []
      let silverCount = 0
      let collectibleCount = []
      for (const drop of spirit.drop) {
        const range = drop[1].split('-')
        const min = parseInt(range[0], 10)
        const max = parseInt(range[1], 10)
        const count = Math.floor(Math.random() * (max - min + 1)) + min

        if (drop[0] === 'silver') {
          silverCount += count
        }
        else {
          collectibleCount.push(count)
          query.push({kind: 'Collectible', id: drop[0]})
        }
      }

      const collectibles = await getEntities(query)

      let collectiblesToAdd = []
      let collectibleTokens = []

      for (let i = 0; i < collectibles.length; i++) {
        for (let j = 1; j <= collectibleCount[i]; j++) {
          const instance = uuidv1()
          const coords = generateDropCoords(spirit.latitude, spirit.longitude)
          let collectible = collectibles[i]
          collectible.id = query[i].id
          collectible.latitude = coords[0]
          collectible.longitude = coords[1]

          collectibleTokens.push(createMapToken(collectible))

          collectiblesToAdd.push(
            addToGeohash('Collectibles', instance, coords),
            addToRedis(instance, collectible),
            addToSet('collectibles', instance)
          )
        }
      }

      if (silverCount > 0) {
        for (let i = 1; i <= silverCount; i++) {
          const instance = uuidv1()
          const coords = generateDropCoords(spirit.latitude, spirit.longitude)

          collectiblesToAdd.push(
            addToGeohash('Collectibles', instance, coords),
            addToRedis(instance, {displayName: 'Silver'}),
            addToSet('collectibles', instance)
          )
        }
      }

      await Promise.all(collectiblesToAdd)
      resolve(collectibleTokens)
    }
    catch (err) {
      reject(err)
    }
  })
}
