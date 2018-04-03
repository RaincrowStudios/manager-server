const client = require('./client')

module.exports = (instance, field, increment) => {
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
      else if (!increment || typeof increment !== 'number') {
        const err = 'Invalid increment: ' + increment
        throw err
      }

      client.hincrby([instance, field, increment], (err, result) => {
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
