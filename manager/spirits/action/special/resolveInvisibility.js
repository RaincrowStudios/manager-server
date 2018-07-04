const informNearbyPlayers = require('../../../../utils/informNearbyPlayers')
const addCondition = require('../addCondition')

module.exports = (caster, target, spell, ingredients) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = { total: 0, conditions: ['spell_invisibility'] }

      await Promise.all([
        addCondition(caster, target, spell, ingredients),
        informNearbyPlayers(
          caster.latitude,
          caster.longitude,
          {
            command: 'map_character_remove',
            instance: caster.instance
          },
          [caster.player]
        ),
      ])
      resolve(result)
    }
    catch (err) {
      reject(err)
    }
  })
}
