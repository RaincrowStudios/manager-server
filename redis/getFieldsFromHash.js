const client = require('./client')

module.exports = (instance, fields) => {
  return new Promise((resolve, reject) => {
    try {
      if (!instance || typeof instance !== 'string') {
        const err = 'Invalid instance: ' + instance
        throw err
      }
      else if (!fields || !Array.isArray(fields)) {
        const err = 'Invalid fields: ' + fields
        throw err
      }

      client.hmget([instance, ...fields], (err, results) => {
        if (err) {
          err.code = '5300'
          reject(err)
        }
        resolve(results.map(result => JSON.parse(result)))
      })
    }
    catch (err) {
      reject(err)
    }
  })
}
