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
    const range = spirit.info.actionFreq.split('-')
    const min = parseInt(range[0], 10)
    const max = parseInt(range[1], 10)
    spirit.info.nextAction +=
      (Math.floor(Math.random() * (max - min)) + min) * 60000

    const charactersNearLocation = await getNearbyFromGeohashByPoint(
      'Characters',
      spirit.info.latitude,
      spirit.info.longitude,
      constants.radiusVisual
    )

    const playersToInform = charactersNearLocation.length !== 0 ?
      await Promise.all(
        charactersNearLocation.map(async (character) => {
          const characterInfo = await getFromRedis(character[0], 'info')
          return characterInfo.owner
        })
      ) : []

    const result = resolveSpiritAction(spirit)

    await Promise.all([
      informPlayers(
        playersToInform,
        {
          command: 'map_spirit_action',
          instance: instance,
          result: result
        }
      ),
      updateRedis(instance, ['info'], [spirit.info])
    ])

    const newTimer =
      setTimeout(spiritAction(instance, spirit), spirit.info.nextAction - Date.now())
    let spiritTimers = timers.by("instance", instance)
    spiritTimers.actionTimer = newTimer
    timers.update(spiritTimers)
  }
  catch (err) {
    console.error(err)
  }
}
