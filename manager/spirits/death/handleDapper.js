const updateHashField = require('../../../redis/updateHashField')
const updateHashFieldObject = require('../../../redis/updateHashFieldObject')
const createMapToken = require('../../../utils/createMapToken')
const generateNewCoordinates = require('../../../utils/generateNewCoordinates')
const informNearbyPlayers = require('../../../utils/informNearbyPlayers')

module.exports = (spirit, killer) => {
  const conditions = {}

  if (spirit.visionType) {
    conditions[0] = {status: 'truesight', undispellable: true}
  }

  if (spirit.visibility) {
    conditions[1] = {status: 'invisible', undispellable: true}
  }

  const [newLatitude, newLongitude] =
    generateNewCoordinates(spirit.latitude, spirit.longitude, 100, 200)

  const update = [
    updateHashField(spirit.instance, 'state', ''),
    updateHashField(spirit.instance, 'energy', spirit.baseEnergy),
    updateHashField(spirit.instance, 'conditions', conditions),
    updateHashField(spirit.instance, 'summonLat', newLatitude),
    updateHashField(spirit.instance, 'summonLong', newLongitude),
    updateHashField(spirit.instance, 'latitude', newLatitude),
    updateHashField(spirit.instance, 'longitude', newLongitude),
    updateHashField(spirit.instance, 'lastAttackedBy', ''),
    updateHashField(spirit.instance, 'lastHealedBy', ''),
    updateHashField(spirit.instance, 'previousTarget', ''),
    updateHashFieldObject(
      killer.type === 'witch' ? killer.instance : spirit.owner,
      'add',
      'activeSpirits',
      spirit.instance
    )
  ]

  if (killer.type === 'witch') {
    update.push(
      updateHashField(spirit.instance, 'owner', killer.instance),
      updateHashField(spirit.instance, 'ownerDisplay', killer.displayName),
      updateHashField(spirit.instance, 'dominion', killer.dominion),
      updateHashField(spirit.instance, 'player', killer.player),
      updateHashField(spirit.instance, 'coven', killer.coven),
    )
  }

  const inform = [
    {
      function: informNearbyPlayers,
      parameters: [
        spirit,
        {
          command: 'map_token_add',
          token: createMapToken(spirit)
        },
        Object.values(spirit.conditions)
          .filter(condition => condition.status === 'invisible').length ?
          1 : 0
      ]
    }
  ]

  return [update, inform]
}
