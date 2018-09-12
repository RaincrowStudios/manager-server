const adjustEnergy = require('../../../redis/adjustEnergy')
const checkKeyExistance = require('../../../redis/checkKeyExistance')
const getOneFromList = require('../../../redis/getOneFromList')
const updateHashField = require('../../../redis/updateHashField')
const informNearbyPlayersUnion = require('../../../utils/informNearbyPlayersUnion')
const addCondition = require('./addCondition')
const calculateCost = require('./calculateCost')
const calculateDamage = require('./calculateDamage')
const calculateHeal = require('./calculateHeal')
const calculateSelf = require('./calculateSelf')
const checkCritical = require('./checkCritical')
const handleSpecial = require('./handleSpecial')
const handleWitchCast = require('./handleWitchCast')

module.exports = (caster, target, spell, ingredients = []) => {
  return new Promise(async (resolve, reject) => {
    try {
      const update = []
      const inform = []

      const [casterExists, targetExists, baseCrit] = await Promise.all([
        checkKeyExistance(caster.instance),
        checkKeyExistance(target.instance),
        getOneFromList('constants', 'baseCrit')
      ])

      if (casterExists && targetExists) {
        const result = { total: 0, critical: false, reflected: 0, effect: 'success', xpGain: 0 }

        if (spell.special) {
          const [total, specialUpdate, specialInform] =
            await handleSpecial(caster, target, spell)

          result.total += total
          update.push(...specialUpdate)
          inform.push(...specialInform)
        }
        else {
          if (spell.range) {
            if (spell.range.includes('#')) {
              result.total += calculateHeal(caster, target, spell.range.slice(1), ingredients)
            }
            else {
              result.total += calculateDamage(caster, target, spell.range, ingredients)
            }
          }
        }

        if (checkCritical(baseCrit, caster, target, ingredients)) {
          result.critical = true

          result.total *= 2
        }

        if (
          result.total < 0 &&
          caster.status === 'vulnerable' &&
          (caster.attributes && caster.attributes.includes('rage')) ||
          (caster.conditions &&
          Object.values(caster.conditions)
            .filter(condition => condition.status === 'rage').length)
        ) {
          result.total = result.total + Math.round(0.5 * result.total)
        }

        let selfEnergy = caster.type === 'witch' ?
          calculateCost(caster, spell) : 0

        if (spell.self) {
          selfEnergy = calculateSelf(spell, result.total)
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

        /*
        if (caster.type === 'witch') {
          const covenBuff = caster.coven ? await calculateCovenBuff(caster) : 0

          if (covenBuff > 2) {
            result.total += Math.sign(result.total) * covenBuff * 0.1
          }
        }
        */

        if (result.total < 0 && Math.abs(result.total) > target.energy) {
          result.total = target.energy * -1
        }

        if (caster.instance === target.instance) {
          if (selfEnergy + result.total) {
            const [energyUpdate, energyInform] =
              await adjustEnergy(caster, selfEnergy + result.total, caster, spell.id)

            update.push(...energyUpdate)
            inform.push(...energyInform)
          }
        }
        else {
          if (selfEnergy) {
            const [energyUpdate, energyInform] =
              await adjustEnergy(caster, selfEnergy, caster, spell.id)

            update.push(...energyUpdate)
            inform.push(...energyInform)
          }
          if (result.total) {
            const [targetEnergyUpdate, targetEnergyInform] =
              await adjustEnergy(target, result.total, caster, spell.id)

            update.push(...targetEnergyUpdate)
            inform.push(...targetEnergyInform)
          }
        }

        if (caster.type === 'witch') {
          const [xpGain, witchUpdate, witchInform] =
            await handleWitchCast(caster, target, spell, result.total, ingredients)

          update.push(...witchUpdate)
          inform.push(...witchInform)
          result.xpGain += xpGain
        }

        inform.unshift(
          {
            function: informNearbyPlayersUnion,
            parameters: [
              caster,
              target,
              {
                command: 'map_spell_cast',
                casterInstance: caster.instance,
                caster: caster.displayName || caster.id,
                targetInstance: target.instance,
                target: target.displayName || target.id,
                spell: spell.id,
                base: spell.base || '',
                result: result
              }
            ]
          }
        )

        update.push(
          updateHashField(
            caster.instance,
            'previousTarget',
            { instance: target.instance, type: target.type }
          )
        )

        if (result.total < 0) {
          update.push(
            updateHashField(
              target.instance,
              'lastAttackedBy',
              { instance: caster.instance, type: caster.type }
            )
          )
        }
        else if (result.total > 0) {
          update.push(
            updateHashField(
              target.instance,
              'lastHealedBy',
              { instance: caster.instance, type: caster.type }
            )
          )
        }

        if (caster.attributes && caster.attributes.includes('bloodlust')) {
          const bloodlustCount = caster.bloodlustCount ?
            caster.bloodlustCount + 1 : 1

          update.push(
            updateHashField(caster.instance, 'bloodlustCount', bloodlustCount)
          )
        }

        if (spell.condition && Math.abs(result.total) < target.energy) {
          const [conditionUpdate, conditionInform] =
            addCondition(caster, target, spell, ingredients)

          update.push(...conditionUpdate)
          inform.push(...conditionInform)
        }
      }

      resolve([update, inform])
    }
    catch (err) {
      reject(err)
    }
  })
}
