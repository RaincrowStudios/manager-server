const addExperience = require('../../redis/addExperience')
const addObjectToHash = require('../../redis/addObjectToHash')
const addToActiveSet = require('../../redis/addToActiveSet')
const addToGeohash = require('../../redis/addToGeohash')
const getAllFromHash = require('../../redis/getAllFromHash')
const getOneFromHash = require('../../redis/getOneFromHash')
const getOneFromList = require('../../redis/getOneFromList')
const removeFromAll = require('../../redis/removeFromAll')
const updateHashFieldArray = require('../../redis/updateHashFieldArray')
const createInstanceId = require('../../utils/createInstanceId')
const createMapToken = require('../../utils/createMapToken')
const determineExperience = require('../../utils/determineExperience')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')
const informPlayers = require('../../utils/informPlayers')
const spiritAdd = require('../spirits/spiritAdd')

module.exports = async (portalInstance) => {
  try {
    const currentTime = Date.now()
    const portal = await getAllFromHash(portalInstance)
    const update = []

    if (portal) {
      const query = [
        getOneFromList('spirits', portal.spirit.id),
        getOneFromList('constants', 'xpMultipliers')
      ]

      if (portal.owner) {
        query.push(
          getOneFromHash(portal.owner, 'aptitude'),
          getOneFromHash(portal.owner, 'summonedSpirits'),
          getOneFromHash(portal.owner, 'activePortals')
        )
      }

      const [
        spiritInfo,
        xpMultipliers,
        aptitude,
        summonedSpirits,
        activePortals
      ] = await Promise.all(query)

      const spirit = Object.assign(
        {}, spiritInfo, portal.spirit, {instance: createInstanceId()}
      )

      spirit.summonLat = portal.latitude
      spirit.summonLong = portal.longitude
      spirit.latitude = portal.latitude
      spirit.longitude = portal.longitude
      spirit.createdOn = currentTime
      spirit.expireOn = spirit.duration > 0 ?
        currentTime + (spirit.duration * 3600000) : 0

      let moveOn
      if (spirit.moveFreq.includes('-')) {
        const range = spirit.moveFreq.split('-')
        const min = parseInt(range[0], 10)
        const max = parseInt(range[1], 10)

        moveOn = currentTime +
          ((Math.floor(Math.random() * (max - min + 1)) + min) * 1000)
      }
      else {
        moveOn = parseInt(spirit.moveFreq, 10)
      }

      spirit.moveOn = moveOn

      let actionOn
      if (spirit.actionFreq.includes('-')) {
        const range = spirit.actionFreq.split('-')
        const min = parseInt(range[0], 10)
        const max = parseInt(range[1], 10)

        actionOn = currentTime +
          ((Math.floor(Math.random() * (max - min + 1)) + min) * 1000)
      }
      else {
        actionOn = parseInt(spirit.actionFreq, 10)
      }

      spirit.actionOn = actionOn

      update.push(
        addObjectToHash(spirit.instance, spirit),
        addToActiveSet('spirits', spirit.instance),
        addToGeohash(
          'spirits',
          spirit.instance,
          spirit.latitude,
          spirit.longitude
        ),
        removeFromAll('portals', portalInstance),
        informNearbyPlayers(
          portal.latitude,
          portal.longitude,
          {
            command: 'map_spirit_summon',
            token: createMapToken(spirit.instance, spirit)
          }
        )
      )

      if (spirit.owner) {
        const firstSummon = summonedSpirits ?
          summonedSpirits.includes(spirit.id) : false

        if (firstSummon) {
          update.push(
            updateHashFieldArray(
              spirit.owner,
              'add',
              'summonedSpirits',
              spirit.id
            )
          )
        }

        const xpGain = determineExperience(
          xpMultipliers,
          'summon',
          firstSummon,
          spirit,
          aptitude
        )

        const index = activePortals.indexOf(portalInstance)

        update.push(
          addExperience(spirit.owner, spirit.dominion, 'witch', xpGain, spirit.coven),
          updateHashFieldArray(
            portal.owner,
            'remove',
            'activePortals',
            portalInstance,
            index
          ),
          updateHashFieldArray(
            portal.owner,
            'add',
            'activeSpirits',
            spirit.instance
          )
        )
      }

      if (spirit.player) {
        update.push(
          informPlayers(
            [spirit.player],
            {
              command: 'character_portal_summon',
              instance: spirit.instance,
              spirit: spirit.id
            }
          )
        )
      }

      await informNearbyPlayers(
        portal.latitude,
        portal.longitude,
        {
          command: 'map_portal_remove',
          instance: portalInstance
        }
      )
      update.push(spiritAdd(spirit.instance, spirit))
      await Promise.all(update)
      /*
      console.log({
        event: 'spirit_summoned',
        player: spirit.player,
        character: spirit.owner,
        spirit: spirit.id
      })
      */
    }
    return true
  }
  catch (err) {
    console.error(err)
  }
}
