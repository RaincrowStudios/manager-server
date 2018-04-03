const client = require('./client')

module.exports = (instance) => {
  return new Promise((resolve, reject) => {
    try {
      if (!instance || typeof instance !== 'string') {
        const err = 'Invalid instance: ' + instance
        throw err
      }

      client.exists([instance], (err, result) => {
        if (err) {
          reject(err)
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
