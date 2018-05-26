const getOneFromHash = require('../redis/getOneFromHash')
const getNearbyFromGeohash = require('../redis/getNearbyFromGeohash')
const informPlayers = require('./informPlayers')

module.exports = (coords1, coords2, message, exclude = []) => {
  return new Promise(async (resolve, reject) => {
    try {
      const displayRadius = await getOneFromHash('list:constants', 'displayRadius')

      const [nearCharacters1, nearCharacters2] = await Promise.all([
          getNearbyFromGeohash(
          'characters',
          coords1[0],
          coords1[1],
          displayRadius
        ),
        getNearbyFromGeohash(
          'characters',
          coords2[0],
          coords2[1],
          displayRadius
        )
      ])

      const nearCharactersUnion = nearCharacters1
        .filter(instance => !nearCharacters2.includes(instance))
        .concat(nearCharacters2)

      const playersToInform =
        await Promise.all(nearCharactersUnion
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
