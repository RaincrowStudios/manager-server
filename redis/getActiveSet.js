const selectRedisClient = require('./selectRedisClient')

module.exports = (category) => {
  return new Promise((resolve, reject) => {
    try {
      if (!category || typeof category !== 'string') {
        throw new Error('Invalid categroy: ' + category)
      }

      const client = selectRedisClient()

      client.zrange(['set:active:' + category, 0, -1], (err, results) => {
        if (err) {
          throw new Error(err)
        }
        else {
          resolve(results)
        }
      })
    }
    catch (err) {
      reject(err)
    }
  })
}
