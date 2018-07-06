const getOneFromHash = require('../redis/getOneFromHash')
const getOneFromList = require('../redis/getOneFromList')
const incrementHashField = require('../redis/incrementHashField')
const informPlayers = require('./informPlayers')

module.exports = (character, newLevel) => {
  return new Promise(async (resolve, reject) => {
    try {
      const [player, baseEnergyByLevel] = await Promise.all([
        getOneFromHash(character, 'player'),
        getOneFromList('constants', 'baseEnergyByLevel')
      ])

      await Promise.all([
        incrementHashField(character, 'silver', 100),
        incrementHashField(character, 'unspentPoints', 1)
      ])

      resolve(
        informPlayers(
          [player],
          {
            command: 'character_level_up',
            level: newLevel,
            baseEnergy: baseEnergyByLevel[newLevel - 1],
          }
        )
      )
    }
    catch (err) {
      reject(err)
    }
  })
}
