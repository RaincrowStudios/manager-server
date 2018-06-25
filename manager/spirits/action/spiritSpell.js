const adjustEnergy = require('../../../redis/adjustEnergy')
const checkKeyExistance = require('../../../redis/checkKeyExistance')
const updateHashField = require('../../../redis/updateHashField')
const informNearbyPlayers = require('../../../utils/informNearbyPlayers')
const informPlayers = require('../../../utils/informPlayers')
const resolveTargetDestruction = require('./resolveTargetDestruction')
const spiritSpellNormal = require('./spiritSpellNormal')
const spiritSpellSpecial = require('./spiritSpellSpecial')

module.exports = (spirit, target, spell) => {
  return new Promise(async (resolve, reject) => {
    try {
      let resolution
      const [spiritExists, targetExists] = await Promise.all([
        checkKeyExistance(spirit.instance),
        checkKeyExistance(target.instance)
      ])

      if (spiritExists && targetExists) {
        if (spell.special) {
          resolution = await spiritSpellSpecial(spirit, target, spell)
        }
        else {
          resolution = await spiritSpellNormal(spirit, target, spell)
        }

        let [targetEnergy, targetState] =
          await adjustEnergy(target.instance, resolution.total)

        const update = [
          informNearbyPlayers(
            spirit.latitude,
            spirit.longitude,
            {
              command: 'map_spirit_action',
              instance: spirit.instance,
              target: target.instance,
              action: spell.displayName
            }
          )
        ]

        if (spirit.state !== 'dead') {
          update.push(
            updateHashField(
              spirit.instance,
              'previousTarget',
              { instance: target.instance, type: 'spirit' }
            )
          )
        }

        if (spirit.attributes && spirit.attributes.includes('bloodlust')) {
          const bloodlustCount = spirit.bloodlustCount ?
            spirit.bloodlustCount + 1 : 1

          update.push(
            updateHashField(spirit.instance, 'bloodlustCount', bloodlustCount)
          )
        }


        if (target.type === 'spirit' && targetState !== 'dead') {
          update.push(
            updateHashField(
              target.instance,
              'lastAttackedBy',
              { instance: spirit.instance, type: 'spirit' }
            )
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
                spell: spell.displayName,
                school: spirit.school,
                result: resolution,
                energy: targetEnergy,
                state: targetState
              }
            )
          )
        }

        await Promise.all(update)

        if (targetState === 'dead') {
          await resolveTargetDestruction(spirit, target, spell)
        }
      }
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
