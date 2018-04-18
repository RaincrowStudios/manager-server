const addFieldsToHash = require('../../../redis/addFieldsToHash')
const addExperience = require('../../../redis/addExperience')
const adjustEnergy = require('../../../redis/adjustEnergy')
const checkKeyExistance = require('../../../redis/checkKeyExistance')
const informNearbyPlayers = require('../../../utils/informNearbyPlayers')
const informPlayers = require('../../../utils/informPlayers')
const determineCritical = require('./determineCritical')
const determineResist = require('./determineResist')
const determineExperience = require('./determineExperience')
const resolveTargetDestruction = require('./resolveTargetDestruction')

module.exports = (spirit, target) => {
  return new Promise(async (resolve, reject) => {
    try {
      const range = spirit.attack.split('-')
      const min = parseInt(range[0], 10)
      const max = parseInt(range[1], 10)
      let critical = false
      let resist = false

      let total = Math.floor(Math.random() * (max - min + 1)) + min

      if (determineCritical(spirit, target)) {
        total += Math.floor(Math.random() * (max - min + 1)) + min

        if (spirit.conditions && spirit.conditions.length !== 0) {
          for (const condition of spirit.conditions.conditions) {
            if (condition.beCrit) {
              total += condition.power
            }
          }
        }
        critical = true
      }

      if (determineResist(target)) {
        Math.round(total /= 2)
        resist = true
      }

      const result = { total: Math.round(total * -1), critical, resist }

      const spiritExists = await checkKeyExistance(spirit.instance)
      const targetExists = await checkKeyExistance(target.instance)

      if (spiritExists && targetExists) {
        const targetCurrentEnergy = await adjustEnergy(target.instance, result.total)

        const xpGain = 5//determineXP()

        //const award = await addExperience('characters', spirit.owner, xpGain)

        let xp = 0
        //if (typeof award === 'number') {
        //  xp = award
      //  }

        await Promise.all([
          informNearbyPlayers(
            spirit.latitude,
            spirit.longitude,
            {
              command: 'map_spirit_action',
              action: 'attack',
              instance: spirit.instance,
              target: target.instance,
              total: result.total,
            }
          ),
          informPlayers(
            [target.player],
            {
              command: 'player_character_hit',
              action: 'attack',
              caster: spirit.instance,
              displayName: spirit.displayName,
              total: result.total,
            }
          ),
          informPlayers(
            [spirit.player],
            {
              command: 'player_spirit_action',
              action: 'attack',
              instance: spirit.instance,
              displayName: spirit.displayName,
              target: target.displayName,
              targetType: target.type,
              total: result.total,
              xpGain: xpGain,
              xp: xp
            }
          ),
          addFieldsToHash(
            spirit.instance,
            ['previousTarget'],
            [{ instance: target.instance, type: 'spirit' }]
          ),
          addFieldsToHash(
            target.instance,
            ['lastAttackedBy'],
            [{ instance: spirit.instance, type: 'spirit' }]
          )
        ])

        if (targetCurrentEnergy <= 0) {
          resolveTargetDestruction(target, spirit.instance)
        }
      }
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
