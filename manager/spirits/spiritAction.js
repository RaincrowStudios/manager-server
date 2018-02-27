const constants = require('../../constants/constants')
const timers = require('../../database/timers')
const getFromRedis = require('../../utils/getFromRedis')
const getNearbyFromGeohashByPoint = require('../../utils/getNearbyFromGeohashByPoint')
const informPlayers = require('../../utils/informPlayers')
const updateGeohash = require('../../utils/updateGeohash')
const updateRedis = require('../../utils/updateRedis')
const determineTargets = require('./action/determineTargets')
const determineAction = require('./action/determineAction')

async function spiritAction(instance, spirit) {
  try {
    const currentTime = Date.now()
    const range = spirit.info.actionFreq.split('-')
    const min = parseInt(range[0], 10)
    const max = parseInt(range[1], 10)
    spirit.info.actionOn =
      currentTime + (Math.floor(Math.random() * (max - min)) + min) * 60000

    const target = await determineTargets(spirit)

    if (target) {
      const result = {}
      if (target.type === 'place' || target.type === 'portal') {
        result = resolveBasicAttack(spirit, target)
      }
      else {
        const action = determineAction(spirit.info)
      }

      const charactersNearLocation =
        await getNearbyFromGeohashByPoint(
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

      await Promise.all([
        informPlayers(
          playersToInform,
          {
            command: 'map_spirit_action',
            instance: instance,
            target: target.instance,
            result: result
          }
        ),
        informPlayers(
          [spirit.info.ownerPlayer],
          {
            command: 'xp_gain',
            xp
          }
        ),
        updateRedis(instance, ['info'], [spirit.info])
      ])
    }
    else {
      await updateRedis(instance, ['info'], [spirit.info])
    }

    const newTimer =
      setTimeout(() =>
        spiritAction(instance, spirit), spirit.info.actionOn - currentTime
      )

    let spiritTimers = timers.by("instance", instance)
    spiritTimers.actionTimer = newTimer
    timers.update(spiritTimers)
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = spiritAction
