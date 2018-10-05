const selectRedisClient = require('./selectRedisClient')

module.exports = (instance) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!instance || typeof instance !== 'string') {
        throw new Error('Invalid instance: ' + instance)
      }

      const client = await selectRedisClient(instance)

      client.del([instance], (err) => {
        if (err) {
          throw new Error('5400')
        }
        else {
          resolve(true)
        }
      })
    }
    catch (err) {
      reject(err)
    }
  })
}
