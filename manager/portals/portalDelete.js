const timers = require('../../database/timers')
const getFieldsFromHash = require('../../redis/getFieldsFromHash')
const removeFromAll = require('../../redis/removeFromAll')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')

module.exports = async (portalInstance) => {
  try {
    const coords =
      await getFieldsFromHash(portalInstance, ['latitude', 'longitude'])

    await Promise.all([
      informNearbyPlayers(
        coords[0],
        coords[1],
        {
          command: 'map_portal_remove',
          instance: portalInstance
        }
      ),
      removeFromAll('portals', portalInstance)
    ])

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
