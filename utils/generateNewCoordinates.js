const checkGeohashOutOfRange = require('./checkGeohashOutOfRange')

function precisionRound(number, precision) {
  const factor = Math.pow(10, precision)
  return Math.round(number * factor) / factor
}

module.exports = (latitude, longitude, min, max) => {
  let newLatitude =
    latitude + (((Math.floor(Math.random() * (max - min)) + min) * 0.00001) *
    (Math.random() < 0.5 ? -1 : 1))

  let newLongitude =
    longitude + (((Math.floor(Math.random() * (max - min)) + min) * 0.00001 *
    Math.cos(latitude * (Math.PI / 180)))  *
    (Math.random() < 0.5 ? -1 : 1))

  if (checkGeohashOutOfRange(newLatitude, newLongitude)) {
    newLatitude = newLatitude + (Math.sign(newLatitude) * -0.01)
    newLongitude = newLongitude + (Math.sign(newLongitude) * -0.01)
  }

  const newCoords = [
    precisionRound(newLatitude, 6),
    precisionRound(newLongitude, 6)
  ]


  return newCoords
}
