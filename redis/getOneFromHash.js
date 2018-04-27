const client = require('./client')

module.exports = (instance, field) => {
  return new Promise((resolve, reject) => {
    try {
      if (!instance || typeof instance !== 'string') {
        throw new Error('Invalid instance: ' + instance)
      }
      else if (!field || typeof field !== 'string') {
        throw new Error('Invalid field: ' + field)
      }

      client.hget([instance, field], (err, results) => {
        if (err) {
          throw new Error('5300')
        }
        else {
          resolve(JSON.parse(results))
        }
      })
    }
    catch (err) {
      reject(err)
    }
  })
}
