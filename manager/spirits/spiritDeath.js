const timers = require('../../database/timers')
const getAllFromHash = require('../../redis/getAllFromHash')
const getOneFromHash = require('../../redis/getOneFromHash')
const removeFromAll = require('../../redis/removeFromAll')
const updateHashFieldArray = require('../../redis/updateHashFieldArray')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')
const informPlayers = require('../../utils/informPlayers')
const deleteAllConditions = require('../conditions/deleteAllConditions')
const addSpiritDrop = require('./death/addSpiritDrop')

module.exports = (spiritInstance, killer) => {
  return new Promise(async (resolve, reject) => {
    try {
      const instanceInfo = await getAllFromHash(spiritInstance)

      if (instanceInfo) {
        const spititInfo = await getOneFromHash('list:spirits', instanceInfo.id)
        const spirit = Object.assign({}, spititInfo, instanceInfo)

        const activeSpirits = await getOneFromHash(spirit.owner, 'activeSpirits')
        const index = activeSpirits.indexOf(spiritInstance)

        if (spirit.drop.length) {
          await addSpiritDrop(spirit)
        }

        await deleteAllConditions(spirit.conditions)

        await Promise.all([
          informNearbyPlayers(
            spirit.latitude,
            spirit.longitude,
            {
              command: 'map_spirit_death',
              instance: spiritInstance,
            }
          ),
          informPlayers(
            [spirit.player],
            {
              command: 'player_spirit_death',
              instance: spiritInstance,
              displayName: spirit.displayName,
              killer: killer.displayName,
              owner: killer.ownerDisplay
            }
          ),
          removeFromAll('spirits', spiritInstance),
          updateHashFieldArray(
            spirit.owner,
            'remove',
            'activeSpirits',
            spiritInstance,
            index
          ),
        ])

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
