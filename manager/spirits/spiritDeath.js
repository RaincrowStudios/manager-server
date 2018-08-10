const timers = require('../../database/timers')
const getOneFromHash = require('../../redis/getOneFromHash')
const getOneFromList = require('../../redis/getOneFromList')
const removeFromAll = require('../../redis/removeFromAll')
const updateHashFieldArray = require('../../redis/updateHashFieldArray')
const informPlayers = require('../../utils/informPlayers')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')
const deleteAllConditions = require('../conditions/deleteAllConditions')
const addSpiritBounty = require('./death/addSpiritBounty')
const addSpiritDrop = require('./death/addSpiritDrop')

module.exports = (entity, killer) => {
  return new Promise(async (resolve, reject) => {
    try {
      const update = []
      const inform = []

      const spiritInfo = await getOneFromList('spirits', entity.id)
      const spirit = Object.assign(
        {}, spiritInfo, entity 
      )

      if (spirit.owner) {
        const activeSpirits =
          await getOneFromHash(spirit.owner, 'activeSpirits')
        const index = activeSpirits.indexOf(spirit.instance)

        update.push(
          updateHashFieldArray(
            spirit.owner,
            'remove',
            'activeSpirits',
            spirit.instance,
            index
          )
        )

        inform.push(
          {
            function: informNearbyPlayers,
            parameters: [
              spirit,
              {
                command: 'map_token_remove',
                instance: spirit.instance,
              },
              Object.values(spirit.conditions)
                .filter(condition => condition.status === 'invisible').length ?
                1 : 0
            ]
          },
          {
            function: informPlayers,
            parameters: [
              [spirit.player],
              {
                command: 'character_spirit_banished',
                spiritInstance: spirit.instance,
                spirit: spirit.id,
              }
            ]
          }
        )

        if (!spirit.owner && killer.type !== 'spirit') {
          update.push(addSpiritBounty(spirit, killer))
        }

        if (!spirit.location) {
          update.push(addSpiritDrop(spirit, killer))
        }

        update.push(
          removeFromAll('spirits', spirit.instance),
          deleteAllConditions(Object.values(spirit.conditions))
        )

        const spiritTimers = timers.by('instance', spirit.instance)
        if (spiritTimers) {
          clearTimeout(spiritTimers.expireTimer)
          clearTimeout(spiritTimers.moveTimer)
          clearTimeout(spiritTimers.actionTimer)
          timers.remove(spiritTimers)
        }

        resolve([update, inform])
      }
    }
    catch (err) {
      reject(err)
    }
  })
}
