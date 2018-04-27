const client = require('./client')

module.exports = (instance, fields) => {
  return new Promise((resolve, reject) => {
    try {
      if (!instance || typeof instance !== 'string') {
        throw new Error('Invalid instance: ' + instance)
      }
      else if (!fields || !Array.isArray(fields)) {
        throw new Error('Invalid fields: ' + fields)
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
