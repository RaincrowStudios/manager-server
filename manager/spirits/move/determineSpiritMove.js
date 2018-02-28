const calculateDistance = require('./calculateDistance')

function precisionRound(number, precision) {
  const factor = Math.pow(10, precision)
  return Math.round(number * factor) / factor
}

module.exports = (spirit) => {
  const range = spirit.moveRange.split('-')
  const min = parseInt(range[0], 10)
  const max = parseInt(range[1], 10)

  let newLat = 0
  let newLong = 0
  do {
    newLat = spirit.latitude +
      (((Math.floor(Math.random() * (max - min + 1)) + min) * 0.00001) *
      (spirit.directionBias[0] < 0 ?
        0 : (Math.random() < spirit.directionBias[0] ? 1 : -1)))

    newLong = spirit.longitude +
      (((Math.floor(Math.random() * (max - min + 1)) + min) * 0.00001 *
      Math.cos(spirit.latitude * (Math.PI / 180)))  *
      (spirit.directionBias[1] < 0 ?
      0 : (Math.random() < spirit.directionBias[1] ? 1 : -1)))
  }
  while (spirit.maxDistance < calculateDistance(spirit.summonLat, spirit.summonLong, newLat, newLong))

  return [precisionRound(newLat, 6), precisionRound(newLong, 6)]
}
