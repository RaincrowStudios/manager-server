const uuidv1 = require('uuid/v1')
const getOneFromHash = require('../../../redis/getOneFromHash')
const addToActiveSet = require('../../../redis/addToActiveSet')
const addToGeohash = require('../../../redis/addToGeohash')
const addObjectToHash = require('../../../redis/addObjectToHash')
const createMapToken = require('../../../utils/createMapToken')
const informPlayers = require('../../../utils/informPlayers')

module.exports = (spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (spirit.bounty.length) {
        const rewards = spirit.bounty.map(async item => {
          let count
          if (item.amount.includes('-')) {
            const range = item.amount.split('-')
            const min = parseInt(range[0], 10)
            const max = parseInt(range[1], 10)
            count = Math.floor(Math.random() * (max - min + 1)) + min
          }
          else {
            count = item.count
          }

          let reward
          if (item.id === 'silver') {
            reward = silver
          }
          else {
            reward = await getOneFromHash('list:collectibles', item.id)
          }

          const tokens = []
          for (let i = 1; i <= count; i++) {
            tokens.push(createMapToken(instance, collectible))
            await Promise.all([
              addObjectToHash(instance, collectible),
              addToActiveSet('collectibles', instance),
              addToGeohash('collectibles', instance, coords[0], coords[1])
            ])
          }
          return tokens
        })

        let dropTokens = []

        for (const array of collectibles) {
          dropTokens.push(...array)
        }

        await informPlayers(
          updateHashFieldArray(
            req.body.characterId,
            command,
            type + 's',
            collectible,
            oldCollectibleIndex
          ),
          [killer.player],
          {
            command: 'character_reward',
            rewards: rewards
          }
        )
      }
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
