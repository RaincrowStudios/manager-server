const getFieldsFromHash = require('../redis/getFieldsFromHash')
const getOneFromHash = require('../redis/getOneFromHash')
const getOneFromList = require('../redis/getOneFromList')
const getNearbyFromGeohash = require('../redis/getNearbyFromGeohash')
const informPlayers = require('./informPlayers')

module.exports = (entity, target, message, trueSightCheck = 0, exclude = []) => {
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

        const [nearCharacters1, nearCharacters2] = await Promise.all([
            getNearbyFromGeohash(
            'characters',
            entity.fuzzyLatitude || entity.latitude,
            entity.fuzzyLongitude || entity.longitude,
            displayRadius
          ),
          getNearbyFromGeohash(
            'characters',
            target.fuzzyLatitude || target.latitude,
            target.fuzzyLongitude || target.longitude,
            displayRadius
          )
        ])

        const nearCharactersUnion = nearCharacters1
          .filter(instance => !nearCharacters2.includes(instance))
          .concat(nearCharacters2)

        playersToInform =
          await Promise.all(nearCharactersUnion
            .filter(instance => !exclude.includes(instance))
            .map(instance => getFieldsFromHash(instance, ['player', 'conditions']))
          )
      }

      if (trueSightCheck === 1) {
        playersToInform = playersToInform
          .filter(player =>
              Object.values(player[1]).map(condition => condition.status).includes('truesight')
            )
            .map(player => player[0])
      }
      else if (trueSightCheck === 2) {
        playersToInform = playersToInform
          .filter(player =>
              !Object.values(player[1]).map(condition => condition.status).includes('truesight')
            )
            .map(player => player[0])
      }
      else {
        playersToInform = playersToInform.map(player => player[0])
      }

      await informPlayers(playersToInform, message)
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
