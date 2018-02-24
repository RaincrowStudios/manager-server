const constants = require('../../constants/constants')
const timers = require('../../database/timers')
const getFromRedis = require('../../utils/getFromRedis')
const getNearbyFromGeohashByPoint = require('../../utils/getNearbyFromGeohashByPoint')
const informPlayers = require('../../utils/informPlayers')
const updateGeohash = require('../../utils/updateGeohash')
const updateRedis = require('../../utils/updateRedis')
const calculateSpiritMove = require('./calculateSpiritMove')

module.exports = async (instance, spirit) => {
  try {
    const range = spirit.info.moveFreq.split('-')
    const min = parseInt(range[0], 10)
    const max = parseInt(range[1], 10)
    spirit.info.nextMove +=
      (Math.floor(Math.random() * (max - min)) + min) * 60000

    const charactersNearOldLocation = await getNearbyFromGeohashByPoint(
      'Characters',
      spirit.info.latitude,
      spirit.info.longitude,
      constants.radiusVisual
    )

    const playersToRemoveSpirit = charactersNearOldLocation.length !== 0 ?
      await Promise.all(
        charactersNearOldLocation.map(async (character) => {
          const characterInfo = await getFromRedis(character[0], 'info')
          return characterInfo.owner
        })
      ) : []

    await informPlayers(
      playersToRemoveSpirit,
      {
        command: 'map_remove',
        instance: instance
      }
    )

    const newCoords = await calculateSpiritMove(spirit)

    spirit.info.latitude = newCoords[0]
    spirit.info.longitude = newCoords[1]
    spirit.mapSelection.latitude = newCoords[0]
    spirit.mapSelection.longitude = newCoords[1]
    spirit.mapToken.latitude = newCoords[0]
    spirit.mapToken.longitude = newCoords[1]

    const charactersNearNewLocation = await getNearbyFromGeohashByPoint(
      'Characters',
      spirit.info.latitude,
      spirit.info.longitude,
      constants.radiusVisual
    )

    const playersToAddSpirit = charactersNearNewLocation.length !== 0 ?
      await Promise.all(
        charactersNearNewLocation.map(async (character) => {
          const characterInfo = await getFromRedis(character[0], 'info')
          return characterInfo.owner
        })
      ) : []

    await Promise.all([
      informPlayers(
        playersToAddSpirit,
        {
          command: 'map_add',
          instance: instance,
          token: spirit.mapToken
        }
      ),
      updateRedis(
        instance,
        [
          'info',
          'mapSelection',
          'mapToken'
        ],
        [
          spirit.info,
          spirit.mapSelection,
          spirit.mapToken
        ]
      ),
      updateGeohash(
        'Spirits',
        instance,
        spirit.info.latitude,
        spirit.info.longitude
      )
    ])

    const newTimer = setTimeout(moveSpirit(instance, spirit), spirit.info.nextMove)
    let spiritTimers = timers.by("instance", instance)
    spiritTimers.moveTimer = newTimer
    timers.update(spiritTimers)
  }
  catch (err) {

  }
}
