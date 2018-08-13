const removeFromAll = require('../../../redis/removeFromAll')
const updateHashFieldArray = require('../../../redis/updateHashFieldArray')
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

      const index = spirit.carrying
        .map(carried => carried.id)
        .indexOf(collectible.id)

      update.push(
        removeFromAll('collectibles', collectible.instance),
      )

      if (index >= 0) {
        update.push(
          updateHashFieldArray(
            spirit.instance,
            'replace',
            'carrying',
            {
              id: collectible.id,
              type: collectible.type,
              count: spirit.carrying[index].count + count
            },
            index
          )
        )
      }
      else {
        update.push(
          updateHashFieldArray(
            spirit.instance,
            'add',
            'carrying',
            {
              id: collectible.id,
              type: collectible.type,
              count: count
            }
          )
        )
      }

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
