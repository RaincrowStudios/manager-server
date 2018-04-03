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

module.exports = (instance, spirit, targetInstance, target) => {
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

      const spiritExists = await checkKeyExistance(instance)
      const targetExists = await checkKeyExistance(targetInstance)

      if (spiritExists && targetExists) {
        let targetCurrentEnergy, targetDead
        [targetCurrentEnergy, targetDead] =
          await adjustEnergy(targetInstance, result.total)

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
              instance: instance,
              target: targetInstance,
              total: result.total,
            }
          ),
          informPlayers(
            [spirit.ownerPlayer],
            {
              command: 'player_spirit_action',
              action: 'attack',
              instance: instance,
              displayName: spirit.displayName,
              target: target.displayName,
              targetType: target.type,
              total: result.total,
              xpGain: xpGain,
              xp: xp
            }
          ),
          addFieldsToHash(
            instance,
            ['previousTarget'],
            [{targetInstance, type: 'spirit' }]
          ),
          addFieldsToHash(
            targetInstance,
            ['lastAttackedBy'],
            [{ instance, type: 'spirit' }]
          )
        ])

        if (targetDead) {
          resolveTargetDestruction(targetInstance, target, instance)
        }
      }
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
