function degreeToRadians(degree) {
  return degree * (Math.PI/180)
}

function radiansToDegrees(radian) {
  return radian * (180/Math.PI)
}

function precisionRound(number, precision) {
  const factor = Math.pow(10, precision)
  return Math.round(number * factor) / factor
}

module.exports = (latitudeDegree, longitudeDegree, min, max, direction = false) => {
  const earthRadius = 6371
  const distance = Math.floor(Math.random() * (max/1000 - min/1000)) + min/1000
  const bearing = direction !== false ? direction : Math.floor(Math.random() * 360)
  const latitude = degreeToRadians(latitudeDegree)
  const longitude = degreeToRadians(longitudeDegree)

  let newLatitude = Math.asin(
    Math.sin(latitude) * Math.cos(distance/earthRadius) +
    Math.cos(latitude) * Math.sin(distance/earthRadius) * Math.cos(bearing)
  )

  let newLongitude = longitude + Math.atan2(
    Math.sin(bearing) * Math.sin(distance/earthRadius) * Math.cos(latitude),
    Math.cos(distance/earthRadius) - Math.sin(latitude) * Math.sin(newLatitude))

  newLongitude = (newLongitude + 540) % 360 - 180

  newLatitude = radiansToDegrees(newLatitude)
  newLongitude = radiansToDegrees(newLongitude)

  if (newLatitude < -85.05112878 || newLatitude > 85.05112878) {
    newLatitude = (Math.sign(newLatitude) * 85.05)
  }

  return [precisionRound(newLatitude, 6), precisionRound(newLongitude, 6)]
}
