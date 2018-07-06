const adjustEnergy = require('../../../redis/adjustEnergy')
const checkKeyExistance = require('../../../redis/checkKeyExistance')
const getOneFromList = require('../../../redis/getOneFromList')
const updateHashField = require('../../../redis/updateHashField')
const informNearbyPlayers = require('../../../utils/informNearbyPlayers')
const informPlayers = require('../../../utils/informPlayers')
const determineCritical = require('./determineCritical')
const resolveTargetDestruction = require('./resolveTargetDestruction')
const spiritSpellNormal = require('./spiritSpellNormal')
const spiritSpellSpecial = require('./spiritSpellSpecial')

module.exports = (spirit, target, spell) => {
  return new Promise(async (resolve, reject) => {
    try {
      const [spiritExists, targetExists, baseCrit] = await Promise.all([
        checkKeyExistance(spirit.instance),
        checkKeyExistance(target.instance),
        getOneFromList('constants', 'baseCrit')
      ])

      if (spiritExists && targetExists) {
        const result = { total: 0, critical: false, conditions: [] }
        if (spell.special) {
          const {total, conditions} =
            await spiritSpellSpecial(spirit, target, spell)

          result.total += total
          result.conditions.push(...conditions)
        }
        else {
          const {total, conditions} =
            await spiritSpellNormal(spirit, target, spell)

          result.total += total
          result.conditions.push(...conditions)
        }

        if (determineCritical(spirit, target, baseCrit)) {
          result.critical = true
          if (spell.special) {
            const {total, conditions} =
              await spiritSpellSpecial(spirit, target, spell)

            result.total += total
            result.conditions.push(...conditions)
          }
          else {
            const {total, conditions} =
              await spiritSpellNormal(spirit, target, spell)

            result.total += total
            result.conditions.push(...conditions)
          }
        }

        const [targetEnergy, targetState] =
          await adjustEnergy(target.instance, result.total)

        const update = [
          informNearbyPlayers(
            spirit.latitude,
            spirit.longitude,
            {
              command: 'map_spirit_action',
              instance: spirit.instance,
              target: target.instance,
              action: spell.id
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
                caster: spirit.id,
                type: spirit.type,
                degree: spirit.degree,
                spell: spell.id,
                base: spell.base,
                result: result,
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
