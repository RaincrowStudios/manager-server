const timers = require('../../database/timers')
const getOneFromList = require('../../redis/getOneFromList')
const getAllFromHash = require('../../redis/getAllFromHash')
const removeFromAll = require('../../redis/removeFromAll')
const updateHashFieldObject = require('../../redis/updateHashFieldObject')
const handleLocationLose = require('../../utils/handleLocationLose')
const informPlayers = require('../../utils/informPlayers')
const informLogger = require('../../utils/informLogger')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')
const deleteAllConditions = require('../conditions/deleteAllConditions')
const addSpiritBounty = require('./death/addSpiritBounty')
const addSpiritDrop = require('./death/addSpiritDrop')
const handleDapper = require('./death/handleDapper')

module.exports = (entity, killer) => {
  return new Promise(async (resolve, reject) => {
    try {
      const update = []
      const inform = []

      const spiritTemplate = await getOneFromList('spirits', entity.id)
      const spirit = Object.assign(
        {}, spiritTemplate, entity
      )
      const location = await getAllFromHash(spirit.location)

      if (spirit.location) {
        update.push(
          updateHashFieldObject(
            spirit.location,
            'remove',
            'spirits',
            spirit.instance
          )
        )
        if (!(Object.keys(location.spirits).length - 1)) {
          const [controlUpdate, controlInform] = await handleLocationLose(location)
          update.push(...controlUpdate)
          inform.push(...controlInform)
        }
      }

      if (spirit.owner) {
        update.push(
          updateHashFieldObject(
            spirit.owner,
            'remove',
            'activeSpirits',
            spirit.instance
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
                instance: spirit.instance,
                spirit: spirit.id,
                killer: killer.displayName || killer.id,
                type: killer.type,
                owner: killer.ownerDisplay || ''
              }
            ]
          }
        )

        if (!spirit.owner && killer.type !== 'spirit') {
          const [bountyUpdate, bountyInform] = await addSpiritBounty(spirit, killer)
          update.push(...bountyUpdate)
          inform.push(...bountyInform)
        }

        if (!spirit.location) {
          const [dropUpdate, dropInform] = await addSpiritDrop(spirit, killer)
          update.push(...dropUpdate)
          inform.push(...dropInform)
        }

        update.push(
          deleteAllConditions(Object.values(spirit.conditions))
        )

        if (spirit.attributes.includes('dapper')) {
          const [dapperUpdate, dapperInform] = await handleDapper(spirit, killer)
          update.push(...dapperUpdate)
          inform.push(...dapperInform)
        }
        else {
          update.push(removeFromAll('spirits', spirit.instance))

          const spiritTimers = timers.by('instance', spirit.instance)
          if (spiritTimers) {
            clearTimeout(spiritTimers.expireTimer)
            clearTimeout(spiritTimers.moveTimer)
            clearTimeout(spiritTimers.actionTimer)
            timers.remove(spiritTimers)
          }
        }

        update.push(
          informLogger({
            route: 'spiritExit',
            character_id: spirit.owner,
            spirit_id: spirit.id,
            latitude: spirit.latitude,
            longitude: spirit.longitude,
            killed_by: '',
            attacker_id: killer.id,
            spell_used: ''
          })
        )

        await Promise.all(update)

        for (const informObject of inform) {
          const informFunction = informObject.function
          await informFunction(...informObject.parameters)
        }

        resolve(true)
      }
    }
    catch (err) {
      reject(err)
    }
  })
}
