const uuidv1 = require('uuid/v1')
const addObjectToHash = require('../../redis/addObjectToHash')
const addToActiveSet = require('../../redis/addToActiveSet')
const addToGeohash = require('../../redis/addToGeohash')
const getAllFromHash = require('../../redis/getAllFromHash')
const removeFromAll = require('../../redis/removeFromAll')
const updateHashFieldArray = require('../../redis/updateHashFieldArray')
const createMapToken = require('../../utils/createMapToken')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')
const informPlayers = require('../../utils/informPlayers')
const spiritAdd = require('../spirits/spiritAdd')

module.exports = async (portalInstance) => {
  try {
    const currentTime = Date.now()

    const portal = await getAllFromHash(portalInstance)

    if (portal) {
      const spiritInstance = uuidv1()
      const spirit = portal.spirit

      spirit.createdOn = currentTime
      spirit.expiresOn = currentTime + spirit.duration
      spirit.moveOn = currentTime
      spirit.actionOn = currentTime

      spirit.summonLat = portal.latitude
      spirit.summonLong = portal.longitude
      spirit.latitude = portal.latitude
      spirit.longitude = portal.longitude

      await Promise.all([
        addObjectToHash(spiritInstance, spirit),
        addToActiveSet('spirits', spiritInstance),
        addToGeohash(
          'spirits',
          spiritInstance,
          spirit.latitude,
          spirit.longitude
        ),
        removeFromAll('portals', portalInstance),
        updateHashFieldArray(
          portal.owner,
          'add',
          'activeSpirits',
          spiritInstance
        ),
      ])

      await Promise.all([
        informNearbyPlayers(
          portal.latitude,
          portal.longitude,
          {
            command: 'map_portal_remove',
            instance: portalInstance
          }
        ),
        informNearbyPlayers(
          portal.latitude,
          portal.longitude,
          {
            command: 'map_spirit_add',
            tokens: [createMapToken(spiritInstance, spirit)]
          }
        ),
        informPlayers(
          [spirit.ownerPlayer],
          {
            command: 'player_spirit_summon',
            instance: spiritInstance,
            displayName: spirit.displayName
          }
        )
      ])
      spiritAdd(spiritInstance, spirit)
      console.log({
        event: 'spirit_summoned',
        player: spirit.ownerPlayer,
        character: spirit.owner,
        spirit: spirit.id
      })
    }
  }
  catch (err) {
    console.error(err)
  }
}
