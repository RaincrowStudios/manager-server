module.exports = (info) => {
  let token
  switch (info.type) {
    case 'spirit':
      token = {
        displayName: info.displayName,
        type: info.type,
        degree: info.degree,
        latitude: info.latitude,
        longitude: info.longitude
      }
      break
    case 'portal':
      token = {
        type: info.type,
        degree: info.degree,
        latitude: info.latitude,
        longitude: info.longitude
      }
      break
    case 'herb':
    case 'gem':
    case 'tool':
    case 'silver':
      token = {
        displayName: info.displayName,
        type: info.type,
        latitude: info.latitude,
        longitude: info.longitude,
      }
      break
    case 'witch':
      token = {
        type: info.type,
        male: info.male,
        degree:  info.degree,
        latitude: info.latitude,
        longitude: info.longitude,
        distance: info.distance,
      }
      break
    default:
      break
  }
  return token
}
