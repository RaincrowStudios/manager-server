const timers = require('../database/timers')
const deleteAllConditions = require('../manager/conditions/deleteAllConditions')
const portalDestroy = require('../manager/portals/portalDestroy')
const spiritDeath = require('../manager/spirits/spiritDeath')
const getOneFromHash = require('../redis/getOneFromHash')
const getOneFromList = require('../redis/getOneFromList')
const updateHashFieldObject = require('../redis/updateHashFieldObject')
const informNearbyPlayers = require('./informNearbyPlayers')
const informPlayers = require('./informPlayers')

module.exports = (target, killer, action = '') => {
  return new Promise(async (resolve, reject) => {
    try {
      const update = []
      const inform = []

      if (target.type === 'spirit') {
        update.push(spiritDeath(target, killer))

        inform.push(
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

          inform.push(
            {
              function: informPlayers,
              parameters: [
                [target.player],
                {
                  command: 'character_location_boot'
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

        const displayName = killer.owner ?
          await getOneFromHash(killer.owner, 'displayName') :
          await getOneFromHash(killer.caster, 'displayName')

        inform.push(
          {
            function: informPlayers,
            parameters: [
              [target.player],
              {
                command: 'character_death',
                displayName: displayName,
                spirit: killer.type === 'spirit' ? killer.id : '',
                action: action
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
