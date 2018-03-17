const getAllFromHash = require('../../../redis/getAllFromHash')
const calculateDistance = require('./calculateDistance')

function precisionRound(number, precision) {
  const factor = Math.pow(10, precision)
  return Math.round(number * factor) / factor
}

module.exports = (spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      let newLat = 0
      let newLong = 0

      if (spirit.moveRange.includes('-')) {
        const range = spirit.moveRange.split('-')
        const min = parseInt(range[0], 10)
        const max = parseInt(range[1], 10)

        do {
          newLat = spirit.latitude +
            (((Math.floor(Math.random() * (max - min + 1)) + min) * 0.00001) *
            (Math.random() < 0.5 ? 1 : -1))

          newLong = spirit.longitude +
            (((Math.floor(Math.random() * (max - min + 1)) + min) * 0.00001 *
            Math.cos(spirit.latitude * (Math.PI / 180)))  *
            (Math.random() < 0.5 ? 1 : -1))
        }
        while (
          spirit.maxDistance !== 0 &&
          spirit.maxDistance <
          calculateDistance(spirit.summonLat, spirit.summonLong, newLat, newLong)
        )
      }
      else {
        const parts = spirit.moveRange.split(':')
        const destination = parts[0]
        const distance = parseInt(parts[1], 10)

        let target
        switch (destination) {
          case 'summoner':
            target = await getAllFromHash('characters', spirit.owner)
            break
          default:
            break
        }

        newLat = target.latitude +
          (((Math.floor(Math.random() * (distance - 1 + 1)) + 1) * 0.00001) *
          (Math.random() < 0.5 ? 1 : -1))

        newLong = target.longitude +
          (((Math.floor(Math.random() * (distance - 1 + 1)) + 1) * 0.00001 *
          Math.cos(spirit.latitude * (Math.PI / 180)))  *
          (Math.random() < 0.5 ? 1 : -1))
        }

      resolve([precisionRound(newLat, 6), precisionRound(newLong, 6)])
    }
    catch (err) {
      reject(err)
    }
  })
}
