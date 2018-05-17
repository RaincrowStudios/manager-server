const uuidv1 = require('uuid/v1')
const addExperience = require('../../redis/addExperience')
const addObjectToHash = require('../../redis/addObjectToHash')
const addToActiveSet = require('../../redis/addToActiveSet')
const addToGeohash = require('../../redis/addToGeohash')
const getAllFromHash = require('../../redis/getAllFromHash')
const getOneFromHash = require('../../redis/getOneFromHash')
const removeFromAll = require('../../redis/removeFromAll')
const updateHashFieldArray = require('../../redis/updateHashFieldArray')
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
      const spiritInstance = uuidv1()

      const query = [
        getOneFromHash('list:spirits', portal.spirit.id),
        getOneFromHash('list:constants', 'xpMultipliers'),
        getOneFromHash(portal.owner, 'summonedSpirits')
      ]

      if (portal.owner) {
        getOneFromHash(portal.owner, 'activePortals')
      }

      const [spiritInfo, xpMultipliers, summonedSpirits, activePortals] =
        await Promise.all(query)

      const spirit = Object.assign(
        {}, spiritInfo, portal.spirit, {instance: spiritInstance}
      )

      spirit.createdOn = currentTime
      spirit.expireOn = spirit.duration > 0 ?
        currentTime + (spirit.duration * 60000) : 0
      spirit.moveOn = currentTime
      spirit.actionOn = currentTime
      spirit.summonLat = portal.latitude
      spirit.summonLong = portal.longitude
      spirit.latitude = portal.latitude
      spirit.longitude = portal.longitude

      const firstSummon = summonedSpirits.includes(spirit.id)

      const xpGain = determineExperience(xpMultipliers, 'spirit', firstSummon)

      update.push(
        addExperience(spirit.owner, spirit.dominion, xpGain, spirit.coven),
        addObjectToHash(spiritInstance, spirit),
        addToActiveSet('spirits', spiritInstance),
        addToGeohash(
          'spirits',
          spiritInstance,
          spirit.latitude,
          spirit.longitude
        ),
        removeFromAll('portals', portalInstance),
        informNearbyPlayers(
          portal.latitude,
          portal.longitude,
          {
            command: 'map_spirit_summon',
            token: {
              instance: spirit.instance,
              displayName: spirit.displayName,
              summoner: spirit.ownerDisplay,
              type: spirit.type,
              subtype: spirit.tier > 0 ? 'greater' : 'lesser',
              degree: spirit.degree,
              latitude: spirit.latitude,
              longitude: spirit.longitude,
            }
          }
        )
      )

      if (activePortals) {
        const index = activePortals.indexOf(portalInstance)
        update.push(
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
            spiritInstance
          )
        )
      }

      if (spirit.player) {
        update.push(
          informPlayers(
            [spirit.player],
            {
              command: 'character_portal_summon',
              instance: spiritInstance,
              spirit: spirit.displayName
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

      await Promise.all(update)

      spiritAdd(spiritInstance, spirit)
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
