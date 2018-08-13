const getOneFromList = require('../../../redis/getOneFromList')
const updateHashFieldArray = require('../../../redis/updateHashFieldArray')
const getValidSpawns = require('../../../utils/getValidSpawns')
const informNearbyPlayers = require('../../../utils/informNearbyPlayers')

module.exports = (spirit, discovery) => {
  return new Promise(async (resolve, reject) => {
    try {
      const update = []
      const inform = []
      let collectible

      const spawnList = await getValidSpawns(spirit.latitude, spirit.longitude)

      const discoveryPool = spawnList[discovery.type + 's'][parseInt(discovery.rarity, 10)]

      if (discoveryPool && discoveryPool.length) {
        collectible = discoveryPool[
          Math.floor(Math.random() * discoveryPool.length)
        ]

        collectible = await getOneFromList('collectibles', collectible.id)

        const [min, max] = collectible.range.split('-')

        const count = Math.floor(
          Math.random() * (parseInt(max, 10) - parseInt(min, 10) + 1) +
          parseInt(min, 10)
        )

        const index = spirit.carrying
          .map(carried => carried.id)
          .indexOf(collectible.id)

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
              spirit,
              {
                command: 'map_spell_cast',
                casterInstance: spirit.instance,
                caster: spirit.id,
                targetInstance: '',
                target: '',
                spell: 'discover',
                baseSpell: '',
                result: discovery.type
              }
            ]
          }
        )
      }

      resolve([update, inform])
    }
    catch (err) {
      reject(err)
    }
  })
}
