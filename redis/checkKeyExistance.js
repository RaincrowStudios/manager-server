const selectRedisClient = require('./selectRedisClient')

module.exports = (instance) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!instance || typeof instance !== 'string') {
        throw new Error('Invalid instance: ' + instance)
      }

      const client = await selectRedisClient(instance)

      client.exists([instance], (err, result) => {
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
