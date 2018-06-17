const selectRedisClient = require('./selectRedisClient')

module.exports = (category, cursor = 0) => {
  return new Promise((resolve, reject) => {
    try {
      if (!category || typeof category !== 'string') {
        throw new Error('Invalid category: ' + category)
      }
      else if (typeof cursor !== 'number') {
        throw new Error('Invalid cursor: ' + cursor)
      }

      const client = selectRedisClient()

      client.zscan(['set:active:' + category, cursor], (err, results) => {
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
