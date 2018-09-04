const timers = require('../../database/timers')
const getOneFromList = require('../../redis/getOneFromList')
const getAllFromHash = require('../../redis/getAllFromHash')
const removeFromAll = require('../../redis/removeFromAll')
const updateHashFieldObject = require('../../redis/updateHashFieldObject')
const handleLoseLocation = require('../../utils/handleLoseLocation')
const informPlayers = require('../../utils/informPlayers')
const informLogger = require('../../utils/informLogger')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')
const deleteAllConditions = require('../conditions/deleteAllConditions')
const addSpiritBounty = require('./death/addSpiritBounty')
const addSpiritDrop = require('./death/addSpiritDrop')

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
        if(!Object.keys(location.spirits).length-1) {
          const [controlUpdate, controlInform] = await handleLoseLocation(location) 
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
                killer: killer.caster ?
                  killer.caster.displayName || killer.caster.spirit :
                  killer.displayName || killer.id,
                type: killer.type || 'spirit',
                owner: killer.caster ?
                  killer.caster.ownerDisplay || '' : killer.ownerDisplay || ''
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
