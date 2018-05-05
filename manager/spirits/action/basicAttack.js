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
        const targetCurrentEnergy =
          await adjustEnergy(target.instance, result.total ? result.total : 1)

        const xp= 5//determineXP()

        //const award = await addExperience('characters', spirit.owner, xpGain)

        await Promise.all([
          informNearbyPlayers(
            spirit.latitude,
            spirit.longitude,
            {
              command: 'map_spirit_action',
              instance: spirit.instance,
              target: target.instance,
              action: 'Attack'
            }
          ),
          informPlayers(
            [target.player],
            {
              command: 'character_spell_hit',
              caster: spirit.displayName,
              type: spirit.type,
              degree: spirit.degree,
              spell: 'Attack',
              school: spirit.degree,
              result: result,
            }
          ),
          informPlayers(
            [spirit.player],
            {
              command: 'character_spirit_action',
              spirit: spirit.displayName,
              action: 'Attack',
              target: target.displayName,
              targetType: target.type,
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
          resolveTargetDestruction(spirit, target, 'Attack')
        }
      }
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
