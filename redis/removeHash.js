const selectClient = require('./selectClient')

module.exports = (instance) => {
  return new Promise((resolve, reject) => {
    try {
      if (!instance || typeof instance !== 'string') {
        throw new Error('Invalid instance: ' + instance)
      }

      const client = selectClient(instance)

      client.del([instance], (err) => {
        if (err) {
          throw new Error('5400')
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
