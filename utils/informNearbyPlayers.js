const getOneFromHash = require('../redis/getOneFromHash')
const getNearbyFromGeohash = require('../redis/getNearbyFromGeohash')
const getInfoFromRedis = require('../redis/getInfoFromRedis')
const informPlayers = require('../redis/informPlayers')

module.exports = (latitude, longitude, message) => {
  return new Promise(async (resolve, reject) => {
    try {
      const maxDisplay = await getOneFromHash('constants', 'maxDisplay')

      const nearCharacters = await getNearbyFromGeohash(
        'Characters',
        latitude,
        longitude,
        maxDisplay
      )

      const nearCharactersInfo =
        await Promise.all(
          nearCharacters.map(characterName => getInfoFromRedis(characterName))
        )

      const playersToInform =
        nearCharactersInfo.map(character => character.account)

      resolve(await informPlayers(playersToInform, message))
    }
    catch (err) {
      reject(err)
    }
  })
}
