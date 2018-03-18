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

module.exports = async (instance) => {
  try {
    const currentTime = Date.now()

    const portal = await getAllFromHash('portals', instance)
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
        addObjectToHash('spirits', spiritInstance, spirit),
        addToActiveSet('spirits', spiritInstance),
        addToGeohash(
          'spirits',
          spiritInstance,
          spirit.latitude,
          spirit.longitude
        ),
        removeFromAll('portals', instance),
        updateHashFieldArray(
          'characters',
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
            instance: instance
          }
        ),
        informNearbyPlayers(
          portal.latitude,
          portal.longitude,
          {
            command: 'map_spirit_add',
            tokens: [createMapToken(instance, spirit)]
          }
        ),
        informPlayers(
          [spirit.owner],
          {
            command: 'player_spirit_summon',
            spirit: spirit.displayName
          }
        )
      ])
      spiritAdd(spiritInstance, spirit)
    }
  }
  catch (err) {
    console.error(err)
  }
}
