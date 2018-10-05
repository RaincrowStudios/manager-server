const selectRedisClient = require('./selectRedisClient')

module.exports = (category, instance) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!category || typeof category !== 'string') {
        throw new Error('Invalid category: ' + category)
      }
      else if (!instance || typeof instance !== 'string') {
        throw new Error('Invalid instance: ' + instance)
      }

      const client = await selectRedisClient()

      client.zrem(['set:active:' + category, instance], (err) => {
        if (err) {
          throw new Error(err)
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
