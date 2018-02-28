function degreeToRadians(degree) {
  return degree * (Math.PI/180)
}

module.exports = (lat1, lon1, lat2, lon2) => {
  const earthRadius = 6371
  const dLatitude = degreeToRadians(lat2 - lat1)
  const dLongitude = degreeToRadians(lon2 - lon1)
  const a =
    Math.sin(dLatitude / 2) * Math.sin(dLatitude / 2) +
    Math.cos(degreeToRadians(lat1)) * Math.cos(degreeToRadians(lat2)) *
    Math.sin(dLongitude / 2) * Math.sin(dLongitude/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = earthRadius * c

  return distance
}
