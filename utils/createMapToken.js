module.exports = (info) => {
  let token
  switch (info.type) {
    case 'location':
      token = {
        instance: info.instance,
        type: info.type,
        latitude: info.latitude,
        longitude: info.longitude,
        physicalOnly: info.physicalOnly
      }
      break
    case 'portal':
      token = {
        instance: info.instance,
        creator: info.ownerDisplay,
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
        instance: info.instance,
        type: info.type,
        latitude: info.latitude,
        longitude: info.longitude,
      }
      break
    case 'spirit':
      token = {
        instance: info.instance,
        coven: info.coven || '',
        type: info.type,
        degree: info.degree,
        latitude: info.latitude || 0,
        longitude: info.longitude || 0,
        position: info.position || 0,
      }
      break
    case 'witch':
      token = {
        instance: info.instance,
        displayName: info.displayName,
        coven: info.coven || '',
        state: info.state,
        type: info.type,
        male: info.male,
        degree:  info.degree,
        latitude: info.fuzzyLatitude,
        longitude: info.fuzzyLongitude,
        position: info.position || 0,
        physical: info.distance ? false : true,
        immunityList: Object.values(info.immunities).map(immunity => immunity.caster)
      }
      break
    default:
      break
  }
  return token
}
