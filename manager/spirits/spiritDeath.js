const timers = require('../../database/timers')
const getAllFromHash = require('../../redis/getAllFromHash')
const getOneFromHash = require('../../redis/getOneFromHash')
const removeFromAll = require('../../redis/removeFromAll')
const updateHashFieldArray = require('../../redis/updateHashFieldArray')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')
const informPlayers = require('../../utils/informPlayers')
const deleteAllConditions = require('../conditions/deleteAllConditions')
const addSpiritBounty = require('./death/addSpiritBounty')
const addSpiritDrop = require('./death/addSpiritDrop')

module.exports = (spiritInstance, killer) => {
  return new Promise(async (resolve, reject) => {
    try {
      const instanceInfo = await getAllFromHash(spiritInstance)

      if (instanceInfo) {
        const spititInfo = await getOneFromHash('list:spirits', instanceInfo.id)
        const spirit = Object.assign(
          {}, spititInfo, instanceInfo, {instance: spiritInstance}
        )

        const activeSpirits =
          await getOneFromHash(spirit.owner, 'activeSpirits')
        const index = activeSpirits.indexOf(spirit.instance)

        const update = [
          deleteAllConditions(spirit.conditions),
          informNearbyPlayers(
            spirit.latitude,
            spirit.longitude,
            {
              command: 'map_spirit_death',
              instance: spirit.instance,
            }
          ),
          informPlayers(
            [spirit.player],
            {
              command: 'character_spirit_death',
              instance: spirit.instance,
              displayName: spirit.displayName,
              killer: {
                displayName: killer.displayName,
                type: killer.type,
                degree: killer.degree,
                owner: killer.type === 'spirit' ? killer.ownerDisplay : false
              }
            }
          ),
          removeFromAll('spirits', spirit.instance),
          updateHashFieldArray(
            spirit.owner,
            'remove',
            'activeSpirits',
            spirit.instance,
            index
          ),
        ]

        if (spirit.drop.length) {
          update.push(addSpiritDrop(spirit))
        }

        if (!spirit.owner && !killer.type === 'spirit') {
          update.push(addSpiritBounty(spirit, killer))
        }

        await Promise.all(update)
      }
      const spiritTimers = timers.by('instance', spiritInstance)
      if (spiritTimers) {
        clearTimeout(spiritTimers.expireTimer)
        clearTimeout(spiritTimers.moveTimer)
        clearTimeout(spiritTimers.actionTimer)
        timers.remove(spiritTimers)
      }
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
