const adjustEnergy = require('../../../redis/adjustEnergy')
const checkKeyExistance = require('../../../redis/checkKeyExistance')
const updateHashField = require('../../../redis/updateHashField')
const informNearbyPlayers = require('../../../utils/informNearbyPlayers')
const informPlayers = require('../../../utils/informPlayers')
const determineCritical = require('./determineCritical')
const determineResist = require('./determineResist')
const resolveTargetDestruction = require('./resolveTargetDestruction')

module.exports = (spirit, target) => {
  return new Promise(async (resolve, reject) => {
    try {
      const [spiritExists, targetExists] = await Promise.all([
        checkKeyExistance(spirit.instance),
        checkKeyExistance(target.instance)
      ])

      if (spiritExists && targetExists) {
        const range = spirit.attack.split('-')
        const min = parseInt(range[0], 10)
        const max = parseInt(range[1], 10)
        let critical = false
        let resist = false

        let total = Math.floor(Math.random() * (max - min + 1)) + min

        if (determineCritical(spirit, target)) {
          total += Math.floor(Math.random() * (max - min + 1)) + min

          if (spirit.conditions && spirit.conditions.length !== 0) {
            for (const condition of spirit.conditions) {
              if (condition.beCrit) {
                total += condition.power
              }
            }
          }
          critical = true
        }

        if (determineResist(target)) {
          total = Math.round(total / 2)
          resist = true
        }

        const resolution = { total: parseInt(total * -1, 10), critical, resist }

        let [targetEnergy, targetStatus] =
          await adjustEnergy(target.instance, resolution.total)

        const update = [
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
          updateHashField(
            spirit.instance,
            'previousTarget',
            { instance: target.instance, type: 'spirit' }
          ),
        ]

        if (target.type === 'spirit' && targetStatus !== 'dead') {
          update.push(
            updateHashField(
              target.instance,
              'lastAttackedBy',
              { instance: spirit.instance, type: 'spirit' }
            )
          )
        }

        if (spirit.attributes && spirit.attributes.includes('bloodlust')) {
          const bloodlustCount = spirit.bloodlustCount ?
            spirit.bloodlustCount + 1 : 1

          update.push(
            updateHashField(spirit.instance, 'bloodlustCount', bloodlustCount),
          )
        }

        if (target.type !== 'spirit') {
          update.push(
            informPlayers(
              [target.player],
              {
                command: 'character_spell_hit',
                instance: spirit.instance,
                caster: spirit.displayName,
                type: spirit.type,
                degree: spirit.degree,
                spell: 'Attack',
                school: spirit.school,
                result: resolution,
                energy: targetEnergy,
                status: targetStatus
              }
            )
          )
        }

        if (targetStatus === 'dead') {
          update.push(resolveTargetDestruction(spirit, target, 'Attack'))
        }

        await Promise.all(update)
      }
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
