const informNearbyPlayers = require('../../../../utils/informNearbyPlayers')
const addCondition = require('../addCondition')

module.exports = (caster, target, spell, ingredients) => {
  return new Promise(async (resolve, reject) => {
    try {
      const total = 0

      const [update, inform] = addCondition(caster, target, spell, ingredients)

      inform.push(
        {
          function: informNearbyPlayers,
          parameters: [
            caster,
            {
              command: 'map_character_remove',
              instance: caster.instance
            },
            [caster.instance]
          ]
        }
      )

      resolve([total, update, inform])
    }
    catch (err) {
      reject(err)
    }
  })
}
