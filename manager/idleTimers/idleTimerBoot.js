const timers = require('../../database/timers')
const addToGeohash = require('../../redis/addToGeohash')
const getAllFromHash = require('../../redis/getAllFromHash')
const removeFromActiveSet = require('../../redis/removeFromActiveSet')
const removeFromList = require('../../redis/removeFromList')
const removeHash = require('../../redis/removeHash')
const updateHashFieldObject = require('../../redis/updateHashFieldObject')
const informPlayers = require('../../utils/informPlayers')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')
const generateNewCoordinates = require('./components/generateNewCoordinates')

module.exports = (idleTimerInstance) => {
  return new Promise(async (resolve, reject) => {
    try {
      const idleTimer = await getAllFromHash(idleTimerInstance)

      if (idleTimer) {
        const character = await getAllFromHash(idleTimer.character)

        character.instance = idleTimer.character

        const [newLatitude, newLongitude] = generateNewCoordinates(
          character.fuzzyLatitude,
          character.fuzzyLongitude
        )

        const update = [
          addToGeohash(
            'characters',
            character.instance,
            newLatitude,
            newLongitude
          ),
          removeFromActiveSet('idleTimers', idleTimerInstance),
          removeFromList('idleTimers', idleTimer.character),
          removeHash(idleTimerInstance),
          updateHashFieldObject(
            idleTimer.location,
            'remove',
            'occupants',
            idleTimer.character
          )
        ]

        const inform = [
          {
            function: informPlayers,
            parameters: [
              [character.player],
              {
                command: 'character_location_boot',
                latitude: newLatitude,
                longitude: newLongitude
              }
            ]
          },
          {
            function: informNearbyPlayers,
            parameters: [
              character,
              {
                command: 'map_token_remove',
                instance: character.instance,
              },
              Object.values(character.conditions)
                .filter(condition => condition.status === 'invisible').length ?
                1 : 0
            ]
          }
        ]

        await Promise.all(update)

        for (const informObject of inform) {
          const informFunction = informObject.function
          await informFunction(...informObject.parameters)
        }
      }

      const idleTimers = timers.by('instance', idleTimerInstance)
      if (idleTimers) {
        clearTimeout(idleTimers.bootTimer)
        timers.remove(idleTimers)
      }

      informLogger({
        route: 'popLeave',
        pop_id: idleTimer.location,
        character_id: character.instance,
        boot: true 
      })

      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
