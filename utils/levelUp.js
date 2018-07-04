const getOneFromList = require('../redis/getOneFromList')
const informPlayers = require('./informPlayers')

module.exports = (player, newLevel) => {
  return new Promise(async (resolve, reject) => {
    try {
      const baseEnergyByLevel =
        await getOneFromList('constants', 'baseEnergyByLevel')

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
