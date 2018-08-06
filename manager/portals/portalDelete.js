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

    const inform = []
    if (latitude && longitude) {
      inform.push(
        {
          function: informNearbyPlayers,
          parameters: [
            {latitude, longitude},
            {
              command: 'map_token_remove',
              instance: portalInstance
            }
          ]
        }
      )
    }

    await Promise.all(update)

    for (const informObject of inform) {
      const informFunction = informObject.function
      await informFunction(...informObject.parameters)
    }

    const portalTimers = timers.by('instance', portalInstance)
    if (portalTimers) {
      clearTimeout(portalTimers.summonTimer)
      timers.remove(portalTimers)
    }

    return true
  }
  catch (err) {
    console.error(err)
  }
}
