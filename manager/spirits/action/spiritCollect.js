const getOneFromList = require('../../../redis/getOneFromList')
const removeFromAll = require('../../../redis/removeFromAll')
const updateHashFieldObject = require('../../../redis/updateHashFieldObject')
const informNearbyPlayers = require('../../../utils/informNearbyPlayers')

module.exports = (spirit, collectibleInstanceInfo) => {
  return new Promise(async (resolve, reject) => {
    try {
      const update = []
      const inform = []

      const collectibleInfo =
        await getOneFromList('collectibles', collectibleInstanceInfo.id)

      const collectible = Object.assign(
        {}, collectibleInfo, collectibleInstanceInfo
      )

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
            count: spirit.carrying[collectible.id] ?
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
              targetInstance: collectible.instance,
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
