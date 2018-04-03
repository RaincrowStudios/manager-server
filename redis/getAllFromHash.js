const client = require('./client')

module.exports = (instance) => {
  return new Promise((resolve, reject) => {
    try {
      if (!instance || typeof instance !== 'string') {
        const err = 'Invalid instance: ' + instance
        throw err
      }

      client.hgetall([instance], (err, results) => {
        if (err) {
          err.code = '5300'
          reject(err)
        }
        else {
          if (!results) {
            resolve(null)
          }
          else if (results.length !== {}) {
            let object = {}
            for (const keyValue of Object.entries(results)) {
              object[keyValue[0]] = JSON.parse(keyValue[1])
            }
            resolve(object)
          }
          else {
            resolve(false)
          }
        }
      })
    }
    catch (err) {
      reject(err)
    }
  })
}
