const selectClient = require('./selectClient')

module.exports = (instance) => {
  return new Promise((resolve, reject) => {
    try {
      if (!instance || typeof instance !== 'string') {
        throw new Error('Invalid instance: ' + instance)
      }

      const client = selectClient(instance)

      client.exists([instance], (err, result) => {
        if (err) {
          throw new Error(err)
        }
        else {
          resolve(result)
        }
      })
    }
    catch (err) {
      reject(err)
    }
  })
}
