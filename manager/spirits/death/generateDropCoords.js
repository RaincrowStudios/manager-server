module.exports = (latitude, longitude) => {
  function precisionRound(number, precision) {
    const factor = Math.pow(10, precision)
    return Math.round(number * factor) / factor
  }

  const newLongitude = longitude +
  (((Math.floor(Math.random() * (20 - 1 + 1)) + 1) * 0.00001) *
  (Math.random() < 0.5 ? -1 : 1))

  const newLatitude = latitude +
  (((Math.floor(Math.random() * (20 - 1 + 1)) + 1) * 0.00001) *
  (Math.random() < 0.5 ? -1 : 1))

  const newCoords = [
    precisionRound(newLongitude, 6),
    precisionRound(newLatitude, 6)
  ]

  return newCoords
}
