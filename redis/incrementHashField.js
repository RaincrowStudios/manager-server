const client = require('./client')

module.exports = (instance, field, increment) => {
  return new Promise((resolve, reject) => {
    try {
      if (!instance || typeof instance !== 'string') {
        throw new Error('Invalid instance: ' + instance)
      }
      else if (!field || typeof field !== 'string') {
        throw new Error('Invalid field: ' + field)
      }
      else if (!increment || typeof increment !== 'number') {
        throw new Error('Invalid increment: ' + increment)
      }

      client.hincrby([instance, field, increment], (err, result) => {
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
