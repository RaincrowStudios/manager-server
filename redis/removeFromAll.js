const clients = require('../database/clients')

module.exports = (category, instance) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!category || typeof category !== 'string') {
        throw new Error('Invalid category: ' + category)
      }
      else if (!instance || typeof instance !== 'string') {
        throw new Error('Invalid instance: ' + instance)
      }

      const clientList = clients.where(() => true)

      await Promise.all(
        clientList.forEach(client => {
          return new Promise((resolve, reject) => {
            client.multi()
            .zrem(['geo:' + category, instance])
            .zrem(['set:active:' + category, instance])
            .del([instance])
            .exec(err => {
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
