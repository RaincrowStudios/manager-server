const getAndRemoveHash = require('../../../redis/getAndRemoveHash')
const updateHashFieldArray = require('../../../redis/updateHashFieldArray')
const informNearbyPlayers = require('../../../utils/informNearbyPlayers')


module.exports = (spiritInstance, targetInstance) => {
  return new Promise(async (resolve, reject) => {
      try {
        const collectible =
          await getAndRemoveHash(targetInstance)

        const range = collectible.range.split('-')
        const min = parseInt(range[0], 10)
        const max = parseInt(range[1], 10)
        const count = Math.floor(Math.random() * (max - min + 1)) + min

        await updateHashFieldArray(
          spiritInstance,
          'add',
          'carrying',
          {id: collectible.id, range: count + '-' + count}
        )

        await Promise.all([
          informNearbyPlayers(
            collectible.latitude,
            collectible.longitude,
            {
              command: 'map_collectible_remove',
              instance: targetInstance
            }
          ),
          updateHashFieldArray(
            spiritInstance,
            'add',
            'carrying',
            {id: collectible.id, range: collectible.range}
          )
        ])
      }
      catch (err) {
        reject(err)
      }
    })
  }
