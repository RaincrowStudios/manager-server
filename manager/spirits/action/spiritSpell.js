const adjustEnergy = require('../../../redis/adjustEnergy')
const checkKeyExistance = require('../../../redis/checkKeyExistance')
const getOneFromList = require('../../../redis/getOneFromList')
const updateHashField = require('../../../redis/updateHashField')
const informNearbyPlayersUnion = require('../../../utils/informNearbyPlayersUnion')
const determineCritical = require('./determineCritical')
const determineSelf = require('./determineSelf')
const spiritSpellNormal = require('./spiritSpellNormal')
const spiritSpellSpecial = require('./spiritSpellSpecial')

module.exports = (spirit, target, spell) => {
  return new Promise(async (resolve, reject) => {
    try {
      const update = []
      const inform = []

      const [spiritExists, targetExists, baseCrit] = await Promise.all([
        checkKeyExistance(spirit.instance),
        checkKeyExistance(target.instance),
        getOneFromList('constants', 'baseCrit')
      ])

      if (spiritExists && targetExists) {
        const result = { total: 0, critical: false, reflected: 0, effect: 'success', xpGain: 0 }
        let total, interimUpdate, interimInform

        if (spell.special) {
          [total, interimUpdate, interimInform] =
            await spiritSpellSpecial(spirit, target, spell)
        }
        else {
          [total, interimUpdate, interimInform] =
            spiritSpellNormal(spirit, target, spell)
        }

        result.total += total
        update.push(...interimUpdate)
        inform.push(...interimInform)

        if (determineCritical(spirit, target, baseCrit)) {
          result.critical = true

          result.total *= 2
        }

        if (
          result.total < 0 &&
          (spirit.attributes && spirit.attributes.includes('rage')) ||
          (spirit.conditions &&
          Object.values(spirit.conditions)
            .filter(condition => condition.status === 'rage').length)
        ) {
          result.total = result.total + Math.round(0.5 * result.total)
        }

        let selfEnergy = 0
        if (spell.self) {
          selfEnergy = determineSelf(spell, result.total)
        }

        if (
          result.total < 0 &&
          target.conditions &&
          Object.values(target.conditions)
            .filter(condition => condition.status === 'reflective').length
        ) {
          result.reflected = Math.round(result.total / 2)
          selfEnergy += result.reflected
        }

        inform.unshift(
          {
            function: informNearbyPlayersUnion,
            parameters: [
              spirit,
              target,
              {
                command: 'map_spell_cast',
                casterInstance: spirit.instance,
                caster: spirit.id,
                targetInstance: target.instance,
                target: target.id ? target.id : target.displayName,
                spell: spell.id,
                base: spell.base ? spell.base : '',
                result: result
              }
            ]
          }
        )

        update.push(
          updateHashField(
            spirit.instance,
            'previousTarget',
            { instance: target.instance, type: target.type }
          )
        )

        if (spirit.attributes && spirit.attributes.includes('bloodlust')) {
          const bloodlustCount = spirit.bloodlustCount ?
            spirit.bloodlustCount + 1 : 1

          update.push(
            updateHashField(spirit.instance, 'bloodlustCount', bloodlustCount)
          )
        }

        if (result.total < 0) {
          update.push(
            updateHashField(
              target.instance,
              'lastAttackedBy',
              { instance: spirit.instance, type: 'spirit' }
            )
          )
        }
        else if (result.total > 0) {
          update.push(
            updateHashField(
              target.instance,
              'lastHealedBy',
              { instance: spirit.instance, type: 'spirit' }
            )
          )
        }

        const [energyUpdate, energyInform] =
          await adjustEnergy(spirit, selfEnergy, spirit)

        update.push(...energyUpdate)
        inform.push(...energyInform)

        if (
          result.total > 0 &&
          Object.values(spirit.conditions)
            .filter(condition => condition.status === 'mary').length
        ) {
          const [targetEnergyUpdate, targetEnergyInform] =
            await adjustEnergy(target, result.total * -1, spirit)

          update.push(...targetEnergyUpdate)
          inform.push(...targetEnergyInform)
        }
        else {
          const [targetEnergyUpdate, targetEnergyInform] =
            await adjustEnergy(target, result.total, spirit)

          update.push(...targetEnergyUpdate)
          inform.push(...targetEnergyInform)
        }
      }

      resolve([update, inform])
    }
    catch (err) {
      reject(err)
    }
  })
}
