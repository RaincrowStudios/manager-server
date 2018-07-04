const adjustEnergy = require('../../../redis/adjustEnergy')
const checkKeyExistance = require('../../../redis/checkKeyExistance')
const getOneFromList = require('../../../redis/getOneFromList')
const updateHashField = require('../../../redis/updateHashField')
const informNearbyPlayers = require('../../../utils/informNearbyPlayers')
const informPlayers = require('../../../utils/informPlayers')
const determineCritical = require('./determineCritical')
const determineDamage = require('./determineDamage')
const resolveTargetDestruction = require('./resolveTargetDestruction')

module.exports = (spirit, target) => {
  return new Promise(async (resolve, reject) => {
    try {
      const [spiritExists, targetExists, baseCrit] = await Promise.all([
        checkKeyExistance(spirit.instance),
        checkKeyExistance(target.instance),
        getOneFromList('constants', 'baseCrit')
      ])
      let critical = false
      if (spiritExists && targetExists) {
        let damage = determineDamage(spirit, target, spirit.attack)

        if (determineCritical(spirit, target, baseCrit)) {
          critical = true
          damage += determineDamage(spirit, target, spirit.attack)
        }

        let [targetEnergy, targetState] =
          await adjustEnergy(target.instance, damage)

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

        if (target.type === 'spirit' && targetState !== 'dead') {
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
                caster: spirit.id,
                type: spirit.type,
                degree: spirit.degree,
                spell: 'Attack',
                school: spirit.school,
                result: {total: damage, critical: critical},
                energy: targetEnergy,
                state: targetState
              }
            )
          )
        }

        if (targetState === 'dead') {
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
