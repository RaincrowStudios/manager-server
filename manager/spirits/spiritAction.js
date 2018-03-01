const constants = require('../../constants/constants')
const timers = require('../../database/timers')
const getFromRedis = require('../../utils/getFromRedis')
const getNearbyFromGeohashByPoint = require('../../utils/getNearbyFromGeohashByPoint')
const informPlayers = require('../../utils/informPlayers')
const updateGeohash = require('../../utils/updateGeohash')
const updateRedis = require('../../utils/updateRedis')
const determineTargets = require('./action/determineTargets')
const determineAction = require('./action/determineAction')
const resolveBasicAttack = require('./action/resolveBasicAttack')
const resolveSpiritSpell = require('./action/resolveSpiritSpell')
const spiritDeath = require('./spiritDeath')

async function spiritAction(instance, spirit) {
  try {
    const spiritAlive = timers.by("instance", instance)
    if (spiritAlive) {
      const currentTime = Date.now()
      const range = spirit.info.actionFreq.split('-')
      const min = parseInt(range[0], 10)
      const max = parseInt(range[1], 10)
      spirit.info.actionOn =
        currentTime + (Math.floor(Math.random() * (max - min + 1)) + min) * 1000

      let target, index
      [target, index] = await determineTargets(instance, spirit.info)

      if (target) {
        const action = determineAction(spirit.info, index)

        const result =
          action === 'attack' ?
            resolveBasicAttack(spirit.info, target.info) :
            resolveSpiritSpell(spirit.info, action, target.info)


        spirit.info.previousTarget = target.instance
        target.info.energy += result.total
        target.mapSelection.energy += result.total
        target.info.lastAttackBy = { instance, type: 'spirit' }
        console.log(target.info.energy)
        let dead = false
        if (target.info.type === 'spirit' || target.info.energy <= 0) {
          dead = true
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

        console.log({
          event: 'spirit_action',
          spirit: instance,
          owner: spirit.info.ownerPlayer,
          target: target.instance,
          targetOwner: target.info.ownerPlayer,
          action,
          result,
          dead
        })

        if (target.info.type === 'spirit' || dead) {
          await Promise.all([
            informPlayers(
              playersToInform,
              {
                command: 'map_spirit_action',
                instance: instance,
                target: target.instance,
                total: result.total,
                dead: dead
              }
            ),
            informPlayers(
              [spirit.info.ownerPlayer],
              {
                command: 'player_spirit_action',
                instance: instance,
                displayName: spirit.displayName,
                target: target.info.type === 'spirit' ?
                  target.info.displayName : target.instance,
                xp: 'xp_gain'
              }
            ),
            updateRedis(instance, ['info'], [spirit.info]),
            spiritDeath(target.instance, target.info, instance)
          ])
        }
        else {
          await Promise.all([
            informPlayers(
              playersToInform,
              {
                command: 'map_spirit_action',
                instance: instance,
                target: target.instance,
                total: result.total,
                dead: dead
              }
            ),
            informPlayers(
              [spirit.info.ownerPlayer],
              {
                command: 'player_spirit_action',
                instance: instance,
                displayName: spirit.displayName,
                target: target.info.type === 'spirit' ?
                  target.info.displayName : target.instance,
                xp: 'xp_gain'
              }
            ),
            updateRedis(instance, ['info'], [spirit.info]),
            updateRedis(
              target.instance,
              ['info', 'mapSelection', 'mapToken'],
              [target.info, target.mapSelection, target.mapToken]
            )
          ])
        }
      }
      else {
        await updateRedis(instance, ['info'], [spirit.info])
      }

      const newTimer =
        setTimeout(() =>
          spiritAction(instance, spirit), spirit.info.actionOn - currentTime
        )

      let spiritTimers = timers.by("instance", instance)
      if (spiritTimers) {
        spiritTimers.actionTimer = newTimer
        timers.update(spiritTimers)
      }
    }
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = spiritAction
