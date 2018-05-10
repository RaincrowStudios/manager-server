const addFieldsToHash = require('../../../redis/addFieldsToHash')
const getOneFromHash = require('../../../redis/getOneFromHash')
const incrementHashField = require('../../../redis/incrementHashField')
const updateHashFieldArray = require('../../../redis/updateHashFieldArray')
const informPlayers = require('../../../utils/informPlayers')

module.exports = (spirit, killer) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (spirit.bounty.length) {
        const update = []
        const rewards = []
        const collectibles = await Promise.all(spirit.bounty.map(bounty => {
          if (bounty) {
            return new Promise((resolve) => {
              resolve(
                {type: 'silver', displayName: 'Silver Drach', range: bounty.amount}
              )
            })
          }
          else {
            return getOneFromHash('list:collectibles', bounty.id)
          }
        }))

        for (const collectible of collectibles) {
          let count
          if (!collectible.range) {
            count = 1
          }
          else if(collectible.range.includes('-')) {
            const range = collectible.range.split('-')
            const min = parseInt(range[0], 10)
            const max = parseInt(range[1], 10)
            count = Math.floor(Math.random() * (max - min + 1)) + min
          }
          else {
            count = collectible.count
          }

          if (collectible.type === 'silver') {
            update.push(
              incrementHashField(
                killer.instance,
                'silver',
                count
              )
            )
            rewards.push({displayName: 'silver', count: count})
          }
          else {
            if (collectible.type === 'herb') {
              collectible.perserved = false
            }

            const firstPickUp =
              killer.unlockedCollectibles.includes(collectible.id) ?
                false : true

            let command, oldCollectible, oldCollectibleIndex
            if (firstPickUp) {
              command = 'add'

              update.push(
                addFieldsToHash(
                  killer.instance,
                  ['unlockedCollectibles'],
                  [killer.unlockedCollectibles.push(collectible.id)]
                )
              )
            }
            else {
              command = 'replace'

              oldCollectible = killer[collectible.type + 's']
                .filter((old, i) => {
                  if (old.id === collectible.id) {
                    oldCollectibleIndex = i
                    return true
                  }
                })[0]

              collectible.count += oldCollectible.count
            }

            update.push(
              updateHashFieldArray(
                killer.instance,
                command,
                collectible.type + 's',
                collectible,
                oldCollectibleIndex
              )
            )
            rewards.push({displayName: collectible.displayName, count: count})
          }
        }

        update.push(
          informPlayers(
            [killer.player],
            {
              command: 'character_bounty_reward',
              rewards: rewards
            }
          )
        )

        await Promise.all(update)
      }
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
