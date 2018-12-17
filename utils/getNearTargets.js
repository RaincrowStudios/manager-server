const getFieldsFromHash = require('../redis/getFieldsFromHash')
const getNearbyFromGeohash = require('../redis/getNearbyFromGeohash')
const getAllFromHash = require('../redis/getAllFromHash')
const getOneFromList = require('../redis/getOneFromList')
const checkStatus = require('./checkStatus')

module.exports = async (npe, event) => {
  let nearCharacterInstances = []
  let nearCollectibleInstances = []
  let nearPortalInstances = []
  let nearSpiritInstances = []

  let distance
  if (event === 'move') {
    distance =
      npe.type === 'witch'
        ? await getOneFromList('constants', 'displayRadius')
        : npe.visionRange
  } else {
    distance =
      npe.type === 'witch'
        ? await getOneFromList('constants', 'interactionRadius')
        : npe.reach
  }

  // 1 KM
  distance = 1000

  const location = npe.location ? await getAllFromHash(npe.location) : ''

  if (location) {
    ;[nearCharacterInstances, nearSpiritInstances] = [
      Object.keys(location.occupants).filter(
        instance => instance !== npe.instance
      ),
      Object.keys(location.spirits).filter(
        instance => instance !== npe.instance
      )
    ]
  } else {
    ;[
      nearCharacterInstances,
      nearCollectibleInstances,
      nearPortalInstances,
      nearSpiritInstances
    ] = await Promise.all([
      getNearbyFromGeohash('characters', npe.latitude, npe.longitude, distance),
      getNearbyFromGeohash(
        'collectibles',
        npe.latitude,
        npe.longitude,
        distance
      ),
      getNearbyFromGeohash('portals', npe.latitude, npe.longitude, distance),
      getNearbyFromGeohash('spirits', npe.latitude, npe.longitude, distance)
    ])
  }

  nearCharacterInstances = nearCharacterInstances.filter(
    instance => npe.instance !== instance
  )

  nearSpiritInstances = nearSpiritInstances.filter(
    instance => npe.instance !== instance
  )

  const [
    nearCharacters,
    nearCollectibles,
    nearPortals,
    nearSpirits
  ] = await Promise.all([
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
    ),
    Promise.all(
      nearCollectibleInstances.map(instance =>
        getFieldsFromHash(instance, [
          'instance',
          'id',
          'type',
          'latitude',
          'longitude'
        ])
      )
    ),
    Promise.all(
      nearPortalInstances.map(instance =>
        getFieldsFromHash(instance, [
          'instance',
          'type',
          'owner',
          'coven',
          'latitude',
          'longitude'
        ])
      )
    ),
    Promise.all(
      nearSpiritInstances.map(instance =>
        getFieldsFromHash(instance, [
          'instance',
          'id',
          'type',
          'degree',
          'state',
          'owner',
          'coven',
          'conditions',
          'latitude',
          'longitude'
        ])
      )
    )
  ])

  let nearTargets = [
    ...nearCharacters,
    ...nearCollectibles,
    ...nearPortals,
    ...nearSpirits
  ]

  const hasTruesight =
    !npe.conditions || checkStatus(npe.conditions, 'truesight')

  nearTargets = nearTargets.filter(
    target =>
      !target.conditions ||
      !checkStatus(target.conditions, 'invisible') ||
      (checkStatus(target.conditions, 'invisible') && !hasTruesight)
  )

  return nearTargets
}
