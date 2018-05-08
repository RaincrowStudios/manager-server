const getFieldsFromHash = require('../../../redis/getFieldsFromHash')

function precisionRound(number, precision) {
  const factor = Math.pow(10, precision)
  return Math.round(number * factor) / factor
}

module.exports = (spirit, direction) => {
  return new Promise(async (resolve, reject) => {
    try {
      let northSouth, eastWest, oldLat, oldLong
      const range = spirit.moveRange.split('-')
      const min = parseInt(range[0], 10)
      const max = parseInt(range[1], 10)

      if (direction === 'summoner') {
        [oldLat, oldLong] =
          await getFieldsFromHash(spirit.owner, ['latitude', 'longitude'])
          northSouth = (Math.random() < 0.5 ? 1 : -1)
          eastWest = (Math.random() < 0.5 ? 1 : -1)
      }

      else if (direction) {
        oldLat = spirit.latitude
        oldLong = spirit.longitude
        northSouth = direction[0]
        eastWest = direction[1]
      }
      else {
        oldLat = spirit.latitude
        oldLong = spirit.longitude
        northSouth = (Math.random() < 0.5 ? 1 : -1)
        eastWest = (Math.random() < 0.5 ? 1 : -1)
      }

      const newLat = oldLat +
        (((Math.floor(Math.random() * (max - min + 1)) + min) * 0.00001) *
        northSouth)

      const newLong = oldLong +
        (((Math.floor(Math.random() * (max - min + 1)) + min) * 0.00001 *
        Math.cos(oldLat * (Math.PI / 180)))  * eastWest)

      resolve([precisionRound(newLat, 6), precisionRound(newLong, 6)])
    }
    catch (err) {
      reject(err)
    }
  })
}
