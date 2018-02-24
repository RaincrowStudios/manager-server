module.exports = (spirit) => {
  function precisionRound(number, precision) {
  const factor = Math.pow(10, precision)
  return Math.round(number * factor) / factor
}
  const range = spirit.moveRange.split('-')
  const min = parseInt(range[0], 10)
  const max = parseInt(range[1], 10)

  const newLat = spirit.latitude +
    (((Math.floor(Math.random() * (max - min)) + min) * 0.0001) *
    (Math.random() < 0.5 ? -1 : 1))

  const newLong = spirit.longitude +
    (((Math.floor(Math.random() * max) - min) * 0.0001 *
    Math.cos(spirit.latitude * (Math.PI / 180)))  *
    (Math.random() < 0.5 ? -1 : 1))

  return [precisionRound(newLat, 4), precisionRound(newLong, 4)]
}
