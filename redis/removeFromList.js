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

      const clientList = clients.where(() => true)

      await Promise.all(
        clientList.forEach(client => {
          return new Promise((resolve, reject) => {
            client.hdel(['list:' + instance, field], (err) => {
              if (err) {
                reject('5400')
              }
              else {
                resolve(true)
              }
            })
          })
        })
      )
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
