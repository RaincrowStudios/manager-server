const getOneFromList = require('../../../redis/getOneFromList')
const updateHashFieldObject = require('../../../redis/updateHashFieldObject')
const getValidSpawns = require('../../../utils/getValidSpawns')
const informNearbyPlayers = require('../../../utils/informNearbyPlayers')

module.exports = (spirit, discovery) => {
  return new Promise(async (resolve, reject) => {
    try {
      const update = []
      const inform = []
      let collectible

      const spawnList = await getValidSpawns(spirit.latitude, spirit.longitude)

      if (spawnList) {
        const discoveryPool =
          spawnList[discovery.type + 's'][parseInt(discovery.rarity, 10)]

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


          update.push(
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
      }

      resolve([update, inform])
    }
    catch (err) {
      console.error(discovery)
      reject(err)
    }
  })
}
