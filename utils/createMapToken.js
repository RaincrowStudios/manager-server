module.exports = (instance, info) => {
  let token
  switch (info.type) {
    case 'portal':
      token = {
        instance: instance,
        type: info.type,
        subtype: info.subtype,
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
        instance: instance,
        displayName: info.displayName,
        type: info.type,
        latitude: info.latitude,
        longitude: info.longitude,
      }
      break
    case 'spirit':
      token = {
        instance: instance,
        displayName: info.displayName,
        type: info.type,
        subtype: info.subtype,
        degree: info.degree,
        latitude: info.latitude,
        longitude: info.longitude,
        engaged: info.engaged
      }
      break
    case 'witch':
      token = {
        instance: instance,
        displayName: info.displayName,
        type: info.type,
        male: info.male,
        degree:  info.degree,
        latitude: info.fuzzyLatitude,
        longitude: info.fuzzyLongitude,
        distance: info.distance,
        engaged: info.engaged
      }
      break
    default:
      break
  }
  return token
}
