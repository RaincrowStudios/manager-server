const getOneFromHash = require('../redis/getOneFromHash')
const getOneFromList = require('../redis/getOneFromList')
const getNearbyFromGeohash = require('../redis/getNearbyFromGeohash')
const informPlayers = require('./informPlayers')

module.exports = (entity, message, exclude = []) => {
  return new Promise(async (resolve, reject) => {
    try {
      let playersToInform
      if (entity.location) {
        const occupants = await getOneFromHash(entity.location, 'occupants')

        playersToInform = await Promise.all(
          occupants
            .filter(occupant => !exclude.includes(occupant.instance))
            .map(occupant => getOneFromHash(occupant.instance, 'player'))
        )
      }
      else {
        const displayRadius = await getOneFromList('constants', 'displayRadius')

        const nearCharacters = await getNearbyFromGeohash(
          'characters',
          entity.fuzzyLatitude ? entity.fuzzyLatitude : entity.latitude,
          entity.fuzzyLongitude ? entity.fuzzyLongitude : entity.longitude,
          displayRadius
        )

        playersToInform =
          await Promise.all(nearCharacters
            .filter(instance => !exclude.includes(instance))
            .map(instance => getOneFromHash(instance, 'player'))
          )
      }

      await informPlayers(playersToInform, message)
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
