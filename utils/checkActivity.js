const checkKeyExistance = require('../redis/checkKeyExistance')
const getFieldsFromHash = require('../redis/getFieldsFromHash')
const getNearTargets = require('./getNearTargets')

module.exports = async (instance, action) => {
  const exists = await checkKeyExistance(instance)

  if (exists) {
    let npe = await getFieldsFromHash(instance, [
      'id',
      'type',
      'latitude',
      'longitude',
      'location',
      'owner',
      'player',
      'coven',
      'carrying',
      'maxCarry',
      'lastAttackedBy',
      'previousTarget',
      'summonLat',
      'summonLong',
      'conditions',
      'attributes',
      'action',
      'currentPhase',
      'tags'
    ])

    let nearPlayers = await getNearTargets(npe, action)

    nearPlayers = nearPlayers.filter(
      target => target.type === 'witch' && !target.bot
    )

    if (nearPlayers.length === 0) {
      return false
    } else {
      return true
    }
  } else {
    return false
  }
}
