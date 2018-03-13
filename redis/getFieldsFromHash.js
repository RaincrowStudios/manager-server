const client = require('../redis/client')

module.exports = (instance, fields) => {
  return new Promise((resolve, reject) => {
    if (!instance || typeof instance !== 'string') {
      const err = 'Invalid instance: ' + instance
      reject(err)
    }

    client.hmget([instance, ...fields], (err, results) => {
      if (err) {
        err.code = '5300'
        reject(err)
      }
      let object = {}
      if (results) {
        for (const keyValue of Object.entries(results)) {
          object[keyValue[0]] = JSON.parse(keyValue[1])
        }
      }
      resolve(object)
    })
  })
}
