const getOneFromList = require('../../../redis/getOneFromList')
const addToActiveSet = require('../../../redis/addToActiveSet')
const addToGeohash = require('../../../redis/addToGeohash')
const addObjectToHash = require('../../../redis/addObjectToHash')
const createInstanceId = require('../../../utils/createInstanceId')
const createMapToken = require('../../../utils/createMapToken')
const generateNewCoordinates = require('../../../utils/generateNewCoordinates')
const informNearbyPlayers = require('../../../utils/informNearbyPlayers')

module.exports = async (spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      const update = []
      const inform = []

      const drops = spirit.drop ? spirit.drop : []

      if (drops.length || Object.keys(spirit.carrying)) {
        const update = []
        const ids = []

        for (const drop of drops) {
          const roll = Math.floor((Math.random() * 100) + 1)

          if (!drop.chance || roll <= drop.chance) {
            ids.push(drop.id)
          }
        }

        ids.push(...Object.keys(spirit.carrying))

        const collectibles = await Promise.all(
          ids.map(id => getOneFromList('collectibles', id))
        )

        for (const collectible of collectibles) {
          if (collectible) {
            const instance = createInstanceId()

            const [latitude, longitude] =
              generateNewCoordinates(spirit.latitude, spirit.longitude, 10, 30)

            update.push(
              addObjectToHash(
                instance,
                {
                  instance: instance,
                  id: collectible.id,
                  type: collectible.type,
                  latitude: latitude,
                  longitude: longitude
                }
              ),
              addToActiveSet('collectibles', instance),
              addToGeohash('collectibles', instance, latitude, longitude),
            )

            inform.push(
              {
                function: informNearbyPlayers,
                parameters: [
                  spirit,
                  {
                    command: 'map_token_add',
                    token: createMapToken(collectible),
                  }
                ]
              }
            )
          }
        }
      }

      resolve([update, inform])
    }
    catch (err) {
      reject(err)
    }
  })
}
