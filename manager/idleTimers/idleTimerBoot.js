const timers = require('../../database/timers')
const addToGeohash = require('../../redis/addToGeohash')
const getAllFromHash = require('../../redis/getAllFromHash')
const getOneFromHash = require('../../redis/getOneFromHash')
const getFieldsFromHash = require('../../redis/getFieldsFromHash')
const removeFromActiveSet = require('../../redis/removeFromActiveSet')
const removeFromList = require('../../redis/removeFromList')
const removeHash = require('../../redis/removeHash')
const updateHashFieldArray = require('../../redis/updateHashFieldArray')
const informPlayers = require('../../utils/informPlayers')
const generateNewCoordinates = require('../components/generateNewCoordinates')

module.exports = (idleTimerInstance) => {
  return new Promise(async (resolve, reject) => {
    try {
      const idleTimer = await getAllFromHash(idleTimerInstance)

      if (idleTimer) {
        const [characterInfo, occupants] = await Promise.all([
          getFieldsFromHash(idleTimer.character),
          getOneFromHash(idleTimer.location, 'occupants')
        ])

        const [bootedPlayer, fuzzyLatitude, fuzzyLongitude] = characterInfo

        const index = occupants
          .map(occupant => occupant.instance)
          .indexOf(idleTimer.character)

        const playersInLocation = await Promise.all(
          occupants.map(occupant => getOneFromHash(occupant.instance, 'player'))
        )

        const [newLatitude, newLongitude] =
          generateNewCoordinates(fuzzyLatitude, fuzzyLongitude)

        await Promise.all([
          addToGeohash(
            'characters',
            idleTimer.character,
            fuzzyLatitude,
            fuzzyLongitude
          ),
          informPlayers(
            [bootedPlayer],
            {
              command: 'character_boot_to_map',
              latitude: newLatitude,
              longitude: newLongitude
            }
          ),
          informPlayers(
            playersInLocation.filter(player => player !== bootedPlayer),
            {
              command: 'location_character_boot',
              instance: idleTimer.character
            },
          ),
          removeFromActiveSet('idleTimers', idleTimerInstance),
          removeFromList('idleTimers', idleTimer.character),
          removeHash(idleTimerInstance),
          updateHashFieldArray(
            idleTimer.location,
            'remove',
            'occupants',
            idleTimer.character,
            index
          )
        ])
      }

      const idleTimers = timers.by('instance', idleTimerInstance)
      if (idleTimers) {
        clearTimeout(idleTimers.bootTimer)
        timers.remove(idleTimers)
      }

      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
