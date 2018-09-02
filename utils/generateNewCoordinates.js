const checkGeohashOutOfRange = require('./checkGeohashOutOfRange')

module.exports = (latitude, longitude) => {
  let newLatitude =
    latitude + (((Math.floor(Math.random() * (500 - 100)) + 100) * 0.00001) *
    (Math.random() < 0.5 ? -1 : 1))

  let newLongitude =
    longitude + (((Math.floor(Math.random() * (500 - 100)) + 100) * 0.00001 *
    Math.cos(latitude * (Math.PI / 180)))  *
    (Math.random() < 0.5 ? -1 : 1))

  if(checkGeohashOutOfRange(newLatitude, newLongitude)) {
    newLatitude = newLatitude + (Math.sign(newLatitude) * -0.01)
    newLongitude = newLongitude + (Math.sign(newLongitude) * -0.01)
  }

  return [newLatitude, newLongitude]
}
