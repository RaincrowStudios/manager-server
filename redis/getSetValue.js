const selectRedisClient = require('./selectRedisClient')

module.exports = (set, instance) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!set || typeof set !== 'string') {
        throw new Error('Invalid set: ' + set)
      }

      const client = await selectRedisClient()

      client.zrank([set, instance], (err, results) => {
        if (err) {
          throw new Error(err)
        } else {
          resolve(results)
        }
      })
    } catch (err) {
      reject(err)
    }
  })
}
