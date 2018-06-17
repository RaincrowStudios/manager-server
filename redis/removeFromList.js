const clients = require('../database/clients')

module.exports = (instance, field) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!instance || typeof instance !== 'string') {
        throw new Error('Invalid instance: ' + instance)
      }
      else if (!field || typeof field !== 'string') {
        throw new Error('Invalid field: ' + field)
      }

      const clientList = clients.where(() => true).map(entry => entry.client)

      const update = []
      for (const client of clientList) {
        update.push(
          new Promise((resolve, reject) => {
            client.hdel(['list:' + instance, field], (err) => {
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
