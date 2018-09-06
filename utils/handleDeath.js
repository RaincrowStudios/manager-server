const timers = require('../database/timers')
const deleteAllConditions = require('../manager/conditions/deleteAllConditions')
const portalDestroy = require('../manager/portals/portalDestroy')
const spiritDeath = require('../manager/spirits/spiritDeath')
const getOneFromList = require('../redis/getOneFromList')
const updateHashFieldObject = require('../redis/updateHashFieldObject')
const generateNewCoordinates = require('./generateNewCoordinates')
const informNearbyPlayers = require('./informNearbyPlayers')
const informPlayers = require('./informPlayers')

module.exports = (target, killer) => {
  return new Promise(async (resolve, reject) => {
    try {
      const update = []
      const inform = []

      if (target.type === 'spirit') {
        await spiritDeath(target, killer)
      }
      else if (target.type === 'portal') {
        update.push(portalDestroy(target, killer))
      }
      else {
        if (target.location) {
          update.push(
            updateHashFieldObject(
              target.location,
              'remove',
              'occupants',
              target.instance
            )
          )

          const [newLatitude, newLongitude] = generateNewCoordinates(
            target.fuzzyLatitude || target.latitude,
            target.fuzzyLongitude || target.longitude,
            100,
            500
          )

          inform.push(
            {
              function: informPlayers,
              parameters: [
                [target.player],
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
                target,
                {
                  command: 'map_token_remove',
                  instance: target.instance,
                },
                Object.values(target.conditions)
                  .filter(condition => condition.status === 'invisible').length ?
                  1 : 0
              ]
            }
          )

          const idleTimerInstance = await getOneFromList('idleTimers', target.instance)

          const idleTimers = timers.by('instance', idleTimerInstance)
          if (idleTimers) {
            clearTimeout(idleTimers.bootTimer)
            timers.remove(idleTimers)
          }
        }

        if (target.conditions) {
          for (const condition of Object.values(target.conditions)) {
            update.push(
              updateHashFieldObject(
                target.instance,
                'remove',
                'conditions',
                condition.instance
              )
            )
          }
        }

        update.push(
          deleteAllConditions(Object.values(target.conditions))
        )

        inform.push(
          {
            function: informPlayers,
            parameters: [
              [target.player],
              {
                command: 'character_death',
                displayName: target.displayName,
                spirit: killer.caster ? killer.caster.spirit : killer.id,
                spell: killer.caster ? killer.id : ''
              }
            ]
          }
        )
      }

      resolve([update, inform])
    }
    catch (err) {
      reject(err)
    }
  })
}
