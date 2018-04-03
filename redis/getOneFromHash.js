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

      client.hget([instance, field], (err, results) => {
        if (err) {
          err.code = '5300'
          reject(err)
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
