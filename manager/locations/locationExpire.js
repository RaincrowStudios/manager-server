const timers = require('../../database/timers')
const getAllFromHash = require('../../redis/getAllFromHash')
const getFieldsFromHash = require('../../redis/getFieldsFromHash')
const getOneFromList = require('../../redis/getOneFromList')
const removeFromActiveSet = require('../../redis/removeFromActiveSet')
const removeFromAll = require('../../redis/removeFromAll')
const removeFromList = require('../../redis/removeFromList')
const removeHash = require('../../redis/removeHash')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')
const informPlayers = require('../../utils/informPlayers')

module.exports = async (locationInstance) => {
  try {
    const location = await getAllFromHash(locationInstance)

    if (location) {
      const update = [
        informNearbyPlayers(
          location.latitude,
          location.longitude,
          {
            command: 'map_location_remove',
            instance: locationInstance
          }
        ),
        removeFromAll('locations', locationInstance)
      ]

      if (location.occupants.length) {
        const [idleTimerInstances, occupants] = await Promise.all([
          await Promise.all(
            location.occupants.map(occupant =>
              getOneFromList('idleTimers', occupant.instance)
            )
          ),
          await Promise.all(
            location.occupants.map(occupant =>
              getFieldsFromHash(
                occupant.instance,
                ['player', 'latitude', 'longitude']
              )
            )
          )
        ])

        for (const idleTimerInstance of idleTimerInstances) {
          if (idleTimerInstance) {
            update.push(
              removeFromActiveSet('idleTimers', idleTimerInstance),
              removeHash(idleTimerInstance)
            )
            const idleTimers = timers.by('instance', idleTimerInstance)
            if (idleTimers) {
              clearTimeout(idleTimers.bootTimer)
              timers.remove(idleTimers)
            }
          }
        }

        update.push(
          ...location.occupants.map(occupant =>
            removeFromList('idleTimers', occupant.instance)
          )
        )

        for (const occupant of occupants) {
          update.push(
            informPlayers(
              [occupant[0]],
              {
                command: 'location_expire',
                latitude: occupant[1],
                longitude: occupant[2]
              }
            )
          )
        }
      }

      await Promise.all(update)
    }
    const locationTimers = timers.by('instance', locationInstance)
    if (locationTimers) {
      clearTimeout(locationTimers.expireTimer)
      timers.remove(locationTimers)
    }

    return true
  }
  catch (err) {
    console.error(err)
  }
}
