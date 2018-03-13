const client = require('./client')

module.exports = (instance) => {
  return new Promise((resolve, reject) => {
    if (!instance || typeof instance !== 'string') {
      const err = 'Invalid instance: ' + instance
      reject(err)
    }

    client.hgetall(instance, (err, results) => {
      if (err) {
        err.code = '5300'
        reject(err)
      }
      else {
        let object = {}
        for (const keyValue of Object.entries(results)) {
          object[keyValue[0]] = JSON.parse(keyValue[1])
        }
        resolve(object)
      }
    })
  })
}
