const adjustEnergy = require('../../../redis/adjustEnergy')
const checkKeyExistance = require('../../../redis/checkKeyExistance')
const getOneFromList = require('../../../redis/getOneFromList')
const updateHashField = require('../../../redis/updateHashField')
const informNearbyPlayersUnion = require('../../../utils/informNearbyPlayersUnion')
const determineCritical = require('./determineCritical')
const determineDamage = require('./determineDamage')

module.exports = (spirit, target) => {
  return new Promise(async (resolve, reject) => {
    try {
      const update = []
      const inform = []

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

        const [targetEnergyUpdate, targetEnergyInform] =
          await adjustEnergy(target, damage, spirit)

        update.push(...targetEnergyUpdate)
        inform.push(...targetEnergyInform)

        update.push(
          updateHashField(
            spirit.instance,
            'previousTarget',
            { instance: target.instance, type: target.type }
          ),
          updateHashField(
            target.instance,
            'lastAttackedBy',
            { instance: spirit.instance, type: spirit.type }
          )
        )

        inform.unshift(
          {
            function: informNearbyPlayersUnion,
            parameters: [
              spirit, target,
              {
                command: 'map_spell_cast',
                casterInstance: spirit.instance,
                caster: spirit.id,
                targetInstance: target.instance,
                target: target.id ? target.id : target.displayName,
                spell: 'attack',
                base: '',
                result: { total: damage, critical: critical }
              }
            ]
          }
        )

        if (spirit.attributes && spirit.attributes.includes('bloodlust')) {
          const bloodlustCount = spirit.bloodlustCount ?
            spirit.bloodlustCount + 1 : 1

          update.push(
            updateHashField(spirit.instance, 'bloodlustCount', bloodlustCount),
          )
        }
      }

      resolve([update, inform])
    }
    catch (err) {
      reject(err)
    }
  })
}
