const selectRedisClient = require('./selectRedisClient')

module.exports = (instance) => {
  return new Promise((resolve, reject) => {
    try {
      if (!instance || typeof instance !== 'string') {
        throw new Error('Invalid instance: ' + instance)
      }

      const client = selectRedisClient(instance)

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
