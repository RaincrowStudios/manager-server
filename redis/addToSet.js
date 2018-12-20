const selectRedisClient = require('./selectRedisClient')

module.exports = (set, instance) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!set || typeof set !== 'string') {
        throw new Error('Invalid category: ' + set)
      } else if (!instance || typeof instance !== 'string') {
        throw new Error('Invalid instance: ' + instance)
      }

      const client = await selectRedisClient(instance)

      client.zadd([set, Date.now(), instance], err => {
        if (err) {
          throw new Error(err)
        } else {
          resolve(true)
        }
      })
    } catch (err) {
      reject(err)
    }
  })
}
