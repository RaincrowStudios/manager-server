const generateNewCoordinates = require('../../../utils/generateNewCoordinates')

module.exports = (spirit, direction) => {
  return new Promise(async (resolve, reject) => {
    try {
      const range = spirit.moveRange.split('-')
      const min = parseInt(range[0], 10)
      const max = parseInt(range[1], 10)

      const [newLatitude, newLongitude] = generateNewCoordinates(
        spirit.latitude,
        spirit.longitude,
        min,
        max,
        direction
      )

      resolve(newLatitude, newLongitude)
    }
    catch (err) {
      reject(err)
    }
  })
}
