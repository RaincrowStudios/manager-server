const getOneFromList = require('../../../redis/getOneFromList')
const incrementHashField = require('../../../redis/incrementHashField')
const informPlayers = require('../../../utils/informPlayers')

module.exports = (spirit, killer) => {
  return new Promise(async (resolve, reject) => {
    try {
        const rewards = await getOneFromList('constants', 'spiritBountyByTier')

        const update = [
          incrementHashField(killer.instance, 'silver', rewards[spirit.tier - 1])
        ]

        const inform = [
          {
            function: informPlayers,
            parameters: [
              [killer.player],
              {
                command: 'character_silver_add',
                count: rewards[spirit.tier - 1]
              }
            ]
          }
        ]

      resolve([update, inform])
    }
    catch (err) {
      reject(err)
    }
  })
}
