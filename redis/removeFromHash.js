const selectClient = require('./selectClient')

module.exports = (instance, field) => {
  return new Promise((resolve, reject) => {
    try {
      if (!instance || typeof instance !== 'string') {
        throw new Error('Invalid instance: ' + instance)
      }
      else if (!field || typeof field !== 'string') {
        throw new Error('Invalid field: ' + field)
      }

      const client = selectClient(instance)

      client.hdel([instance, field], (err) => {
        if (err) {
          throw new Error(err)
        }
        else {
          resolve(true)
        }
      })
    }
    catch (err) {
      reject(err)
    }
  })
}
