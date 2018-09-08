const timers = require('../../database/timers')
const getAllFromHash = require('../../redis/getAllFromHash')
const getOneFromHash = require('../../redis/getOneFromHash')
const informLogger = require('../../utils/informLogger')
const informPlayers = require('../../utils/informPlayers')

module.exports = (idleTimerInstance) => {
  return new Promise(async (resolve, reject) => {
    try {
      const idleTimer = await getAllFromHash(idleTimerInstance)

      if (idleTimer) {
        const update = []
        const inform = []
        const player = await getOneFromHash(idleTimer.character, 'player')

        inform.push(
          {
            function: informPlayers,
            parameters: [
              [player],
              {
                command: 'character_location_boot'
              }
            ]
          }
        )

        update.push(
          informLogger({
            route: 'popLeave',
            pop_id: idleTimer.location,
            character_id: idleTimer.character,
            boot: true
          })
        )

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

      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
