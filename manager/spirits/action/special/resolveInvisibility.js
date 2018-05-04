const informNearbyPlayers = require('../../../../utils/informManager')
const addCondition = require('../addCondition')

module.exports = (caster, target, spell, ingredients) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = {
        total: 0,
        critical: false,
        resist: false,
        conditions: ['Invisibility']
      }

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
