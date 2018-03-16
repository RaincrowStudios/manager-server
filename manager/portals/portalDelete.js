const timers = require('../../database/timers')
const getFieldsFromHash = require('../redis/getFieldsFromHash')
const informNearbyPlayers = require('../redis/informNearbyPlayers')
const removeFromAll = require('../redis/removeFromAll')

module.exports = async (instance) => {
  try {
    const coords = await getFieldsFromHash(
      'portals',
      instance,
      ['latitude', 'longitude',]
    )

    await Promise.all([
      informNearbyPlayers(
        coords[0],
        coords[1],
        {
          command: 'map_portal_remove',
          instance: instance
        }
      ),
      removeFromAll('portals', instance)
    ])

    const portalTimers = timers.by('instance', instance)
    timers.remove(portalTimers)
  }
  catch (err) {
    console.error(err)
  }
}
