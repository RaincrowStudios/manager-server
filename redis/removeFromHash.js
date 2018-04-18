const client = require('./client')

module.exports = (instance, field) => {
  return new Promise((resolve, reject) => {
    try {
      if (!instance || typeof instance !== 'string') {
        const err = 'Invalid instance: ' + instance
        throw err
      }
      else if (!field || typeof field !== 'string') {
        const err = 'Invalid field: ' + field
        throw err
      }

      client.hdel([instance, field], (err) => {
        if (err) {
          reject(err)
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
