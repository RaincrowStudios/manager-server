const client = require('./client')

module.exports = (key, increment, instance) => {
  return new Promise((resolve, reject) => {
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

      client.zincrby([key, increment, instance], (err, result) => {
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
