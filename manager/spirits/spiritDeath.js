const timers = require('../../database/timers')
const getAllFromHash = require('../../redis/getAllFromHash')
const getOneFromHash = require('../../redis/getOneFromHash')
const getOneFromList = require('../../redis/getOneFromList')
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
        if (instanceInfo.id === undefined) {
          await removeFromAll('spirits', spirit.instance)
          resolve(true)
        }
        const spiritInfo = await getOneFromList('spirits', instanceInfo.id)
        const spirit = Object.assign(
          {}, spiritInfo, instanceInfo, {instance: spiritInstance}
        )

        const update = [
          addSpiritDrop(spirit),
          deleteAllConditions(spirit.conditions),
          informNearbyPlayers(
            spirit.latitude,
            spirit.longitude,
            {
              command: 'map_spirit_death',
              targetInstance: spirit.instance,
              target: spirit.id,
              casterInstance: killer.instance,
              caster: killer.displayName,
              casterType: killer.type,
              casterSummoner: killer.ownerDisplay ? killer.ownerDisplay : false
            }
          )
        ]

        if (spirit.owner) {
          const activeSpirits =
            await getOneFromHash(spirit.owner, 'activeSpirits')
          const index = activeSpirits.indexOf(spirit.instance)
          update.push(
            informPlayers(
              [spirit.player],
              {
                command: 'character_spirit_death',
                instance: spirit.instance,
                spirit: spirit.id,
                casterInstance: killer.instance,
                caster:  killer.type === 'spirit' ? killer.id : killer.displayName,
                casterType: killer.type,
                casterSummoner: killer.type === 'spirit' ? killer.ownerDisplay : false
              }
            ),
            updateHashFieldArray(
              spirit.owner,
              'remove',
              'activeSpirits',
              spirit.instance,
              index
            )
          )
        }

        if (!spirit.owner && killer.type !== 'spirit') {
          update.push(addSpiritBounty(spirit, killer))
        }

        await Promise.all(update)

        await removeFromAll('spirits', spirit.instance)
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
