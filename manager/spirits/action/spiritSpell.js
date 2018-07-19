const adjustEnergy = require('../../../redis/adjustEnergy')
const checkKeyExistance = require('../../../redis/checkKeyExistance')
const getOneFromList = require('../../../redis/getOneFromList')
const updateHashField = require('../../../redis/updateHashField')
const informNearbyPlayers = require('../../../utils/informNearbyPlayers')
const informPlayers = require('../../../utils/informPlayers')
const determineCritical = require('./determineCritical')
const determineSelf = require('./determineSelf')
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

        if (
          result.total < 0 &&
          (spirit.attributes && spirit.attributes.includes('rage')) ||
          (spirit.conditions &&
          spirit.conditions
            .filter(condition => condition.status)
            .map(condition => condition.status)
            .includes('rage'))
        ) {
          result.total = result.total + Math.round(0.5 * result.total)
        }

        let selfEnergy = 0
        if (spell.self) {
          selfEnergy = determineSelf(spell, result.total)
        }
        const [[spiritEnergy, spiritState], [targetEnergy, targetState]] =
          await Promise.all(
            adjustEnergy(spirit.instance, selfEnergy),
            adjustEnergy(target.instance, result.total)
          )

        const update = [
          informNearbyPlayers(
            spirit.latitude,
            spirit.longitude,
            {
              command: 'map_spirit_action',
              targetInstance: target.instance,
              target: target.id ? target.id : target.displayName,
              targetEnergy: targetEnergy,
              targetState: targetEnergy,
              spiritInstance: spirit.instance,
              spirit: spirit.id,
              spiritEnergy: spiritEnergy,
              spiritState: spiritState,
              spell: spell.id,
              base: spell.base ? spell.base : false
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
