const timers = require('../../database/timers')
const getFieldsFromHash = require('../../redis/getFieldsFromHash')
const removeFromAll = require('../../redis/removeFromAll')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')

module.exports = async (portalInstance) => {
  try {
    const [latitude, longitude] =
      await getFieldsFromHash(portalInstance, ['latitude', 'longitude'])

    const update = [
      removeFromAll('portals', portalInstance)
    ]

    if (latitude && longitude) {
      update.push(
        informNearbyPlayers(
          latitude,
          longitude,
          {
            command: 'map_portal_remove',
            instance: portalInstance
          }
        )
      )
    }

    await Promise.all(update)

    const portalTimers = timers.by('instance', portalInstance)
    if (portalTimers) {
      clearTimeout(portalTimers.summonTimer)
      timers.remove(portalTimers)
    }
  }
  catch (err) {
    console.error(err)
  }
}
