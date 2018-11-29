const clients = require('../database/clients')

module.exports = (category, instance) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!category || typeof category !== 'string') {
        throw new Error('Invalid category: ' + category)
      } else if (!instance || typeof instance !== 'string') {
        throw new Error('Invalid instance: ' + instance)
      }

      const clientList = clients.where(() => true).map(entry => entry.client)

      const update = []
      for (const client of clientList) {
        update.push(
          new Promise((resolve, reject) => {
            client
              .multi()
              .zrem(['geo:' + category, instance])
              .zrem(['set:active:' + category, instance])
              .del([instance])
              .exec(err => {
                if (err) {
                  reject(err)
                } else {
                  resolve(true)
                }
              })
          })
        )
      }

      await Promise.all(update)
      resolve(true)
    } catch (err) {
      reject(err)
    }
  })
}
