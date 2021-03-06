const selectRedisClient = require('./selectRedisClient')

module.exports = instance => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!instance || typeof instance !== 'string') {
        throw new Error('Invalid instance: ' + instance)
      }

      const client = await selectRedisClient(instance)

      client.hgetall([instance], (err, results) => {
        if (err) {
          throw new Error('5300')
        } else {
          if (!results) {
            resolve(null)
          } else if (results.length !== {}) {
            let object = {}
            for (const keyValue of Object.entries(results)) {
              object[keyValue[0]] = JSON.parse(keyValue[1])
            }
            resolve(object)
          } else {
            resolve(false)
          }
        }
      })
    } catch (err) {
      reject(err)
    }
  })
}
