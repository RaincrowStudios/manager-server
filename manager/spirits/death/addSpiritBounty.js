const getOneFromHash = require('../../../redis/getOneFromHash')
const incrementHashField = require('../../../redis/incrementHashField')
const updateHashFieldArray = require('../../../redis/updateHashFieldArray')
const informPlayers = require('../../../utils/informPlayers')

module.exports = (spirit, killer) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (spirit.bounty.length) {
        const update = []
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

          if (item.id === 'silver') {
            update.push(
              incrementHashField(
                killer.instance,
                'silver',
                count
              )
            )
            return {displayName: 'silver', count: count}
          }
          else {
            const { type, range, ...rest } =
              await getOneFromHash('list:collectibles', item.id)
            const collectible = rest
            collectible.count = count

            if (type === 'herb') {
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

              oldCollectible = killer[type + 's']
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
                type + 's',
                collectible,
                oldCollectibleIndex
              )
            )
            return {displayName: collectible.displayName, count: count}
          }
        })

        update.push(
          informPlayers(
            [killer.player],
            {
              command: 'character_reward',
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
