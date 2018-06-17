const clients = require('../database/clients')

module.exports = (key, increment, instance) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!key || typeof key !== 'string') {
        throw new Error('Invalid field: ' + key)
      }
      else if (typeof increment !== 'number') {
        throw new Error('Invalid increment: ' + increment)
      }
      else if (!instance || typeof instance !== 'string') {
        throw new Error('Invalid instance: ' + instance)
      }

      const clientList = clients.where(() => true).map(entry => entry.client)

      const update = []
      for (const client of clientList) {
        update.push(
          new Promise((resolve, reject) => {
            client.zincrby([key, increment, instance], (err) => {
              if (err) {
                reject(err)
              }
              else {
                resolve(true)
              }
            })
          })
        )
      }

      await Promise.all(update)
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
