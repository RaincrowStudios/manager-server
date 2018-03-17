const getOneFromHash = require('../redis/getOneFromHash')
const getNearbyFromGeohash = require('../redis/getNearbyFromGeohash')
const informPlayers = require('./informPlayers')

module.exports = (latitude, longitude, message) => {
  return new Promise(async (resolve, reject) => {
    try {
      const maxDisplay = await getOneFromHash('constants', 'all', 'maxDisplay')

      const nearCharacters = await getNearbyFromGeohash(
        'characters',
        latitude,
        longitude,
        maxDisplay
      )

      const playersToInform =
        await Promise.all(
          nearCharacters.map(characterName =>
            getOneFromHash('characters', characterName, 'player')
          )
        )

      await informPlayers(playersToInform, message)
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
