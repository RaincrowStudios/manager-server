const getOneFromHash = require('../redis/getOneFromHash')
const getNearbyFromGeohash = require('../redis/getNearbyFromGeohash')
const informPlayers = require('./informPlayers')

module.exports = (latitude, longitude, message, exclude = []) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (typeof latitude !== 'number' && typeof longitude !== 'number') {
        throw new Error('Invalid coords: ' + latitude + ', ' + longitude)
      }

      const displayRadius =
        await getOneFromHash('list:constants', 'displayRadius')

      const nearCharacters = await getNearbyFromGeohash(
        'characters',
        latitude,
        longitude,
        displayRadius
      )

      const playersToInform =
        await Promise.all(nearCharacters
          .filter(instance => !exclude.includes(instance))
          .map(instance => getOneFromHash(instance, 'player'))
        )

      await informPlayers(playersToInform, message)
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
