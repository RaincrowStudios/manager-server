const getFieldsFromHash = require('../redis/getFieldsFromHash')
const getNearbyFromGeohash = require('../redis/getNearbyFromGeohash')
const getAllFromHash = require('../redis/getAllFromHash')
//const getOneFromList = require('../redis/getOneFromList')
const checkStatus = require('./checkStatus')

module.exports = async instance => {
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

  let nearCharacterInstances = []

  let distance = 4000

  const location = npe.location ? await getAllFromHash(npe.location) : ''

  if (location) {
    ;[nearCharacterInstances] = [
      Object.keys(location.occupants).filter(
        instance => instance !== npe.instance
      )
    ]
  } else {
    ;[nearCharacterInstances] = await Promise.all([
      getNearbyFromGeohash('characters', npe.latitude, npe.longitude, distance)
    ])
  }

  nearCharacterInstances = nearCharacterInstances.filter(
    instance => npe.instance !== instance
  )

  const [nearCharacters] = await Promise.all([
    Promise.all(
      nearCharacterInstances.map(instance =>
        getFieldsFromHash(instance, [
          'instance',
          'bot',
          'type',
          'degree',
          'state',
          'coven',
          'conditions',
          'latitude',
          'longitude'
        ])
      )
    )
  ])

  let nearTargets = [...nearCharacters]

  const hasTruesight =
    !npe.conditions || checkStatus(npe.conditions, 'truesight')

  nearTargets = nearTargets.filter(
    target =>
      !target.conditions ||
      !checkStatus(target.conditions, 'invisible') ||
      (checkStatus(target.conditions, 'invisible') && !hasTruesight)
  )

  nearTargets = nearTargets.filter(target => !target.bot)

  return nearTargets
}
