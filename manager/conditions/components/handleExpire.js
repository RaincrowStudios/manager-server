const adjustEnergy = require('../../../redis/adjustEnergy')
const getAllFromHash = require('../../../redis/getAllFromHash')
const getOneFromList = require('../../../redis/getOneFromList')
const informNearbyPlayers = require('../../../utils/informNearbyPlayers')
const resolveCondition = require('./resolveCondition')

module.exports = (bearer, condition) => {
  return new Promise(async (resolve, reject) => {
    try {
      const spell = await getOneFromList('spells', condition.id)
      const update = []
      const inform = []

      if (spell.condition.onExpiration) {
        const caster = await getAllFromHash(condition.caster)
        const expireEnergy = resolveCondition(spell.condition.onExpiration)

        const [energyUpdate, energyInform] =
          await adjustEnergy(bearer, expireEnergy, caster, condition.id)

          inform.unshift(
            {
              function: informNearbyPlayers,
              parameters: [
                bearer,
                {
                  command: 'map_condition_trigger',
                  condition: {
                    bearer: condition.bearer,
                    instance: condition.instance
                  }
                }
              ]
            }
          )

        update.push(...energyUpdate)
        inform.push(...energyInform)
      }

      resolve([update, inform])
    }
    catch (err) {
      reject(err)
    }
  })
}
