const removeFromAll = require('../../../redis/removeFromAll')
const updateHashFieldObject = require('../../../redis/updateHashFieldObject')
const informNearbyPlayers = require('../../../utils/informNearbyPlayers')

module.exports = (spirit, collectible) => {
  return new Promise(async (resolve, reject) => {
    try {
      const update = []
      const inform = []

      const [min, max] = collectible.range.split('-')

      const count = Math.floor(
        Math.random() * (parseInt(max, 10) - parseInt(min, 10) + 1) +
        parseInt(min, 10)
      )

      update.push(
        removeFromAll('collectibles', collectible.instance),
        updateHashFieldObject(
          spirit.instance,
          'add',
          'carrying',
          collectible.id,
          {
            type: collectible.type,
            count: spirit.carrying[collectible.id].count ?
              spirit.carrying[collectible.id].count + count : count
          }
        )
      )

      inform.push(
        {
          function: informNearbyPlayers,
          parameters: [
            collectible,
            {
              command: 'map_token_remove',
              instance: collectible.instance
            }
          ]
        },
        {
          function: informNearbyPlayers,
          parameters: [
            spirit,
            {
              command: 'map_spell_cast',
              casterInstance: spirit.instance,
              caster: spirit.id,
              targetInstance: '',
              target: '',
              spell: 'collect',
              baseSpell: '',
              result: collectible.type
            }
          ]
        }
      )

      resolve([update, inform])
    }
    catch (err) {
      reject(err)
    }
  })
}
