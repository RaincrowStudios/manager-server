const timers = require('../../database/timers')
const getAllFromHash = require('../../redis/getAllFromHash')
const removeFromAll = require('../../redis/removeFromAll')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')

module.exports = async (instance) => {
  try {
    const rift = await getAllFromHash(instance)

    if (rift) {
      await Promise.all([
        informNearbyPlayers(
          rift.latitude,
          rift.longitude,
          {
            command: 'map_rift_remove',
            instance: instance
          }
        ),
        removeFromAll('rifts', instance)
      ])

      console.log({
        event: 'rift_expired',
        rift: instance
      })
    }
    const riftTimers = timers.by('instance', instance)
    if (riftTimers) {
      clearTimeout(riftTimers.expireTimer)
      clearTimeout(riftTimers.summonTimer)
      timers.remove(riftTimers)
    }
  }
  catch (err) {
    console.error(err)
  }
}
