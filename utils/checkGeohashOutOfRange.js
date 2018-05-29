module.exports = (latitude, longitude) => {
  if (latitude < -85.05112878 || latitude > 85.05112878) {
    return true
  }
  else if (longitude < -180 || longitude > 180) {
    return true
  }
  return false
}
