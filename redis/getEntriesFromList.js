const selectRedisClient = require('./selectRedisClient')

module.exports = (listName, fields) => {
  return new Promise((resolve, reject) => {
    try {
      if (!listName || typeof listName !== 'string') {
        throw new Error('Invalid list: ' + listName)
      }
      else if (!fields || !Array.isArray(fields)) {
        throw new Error('Invalid fields: ' + fields)
      }

      const client = selectRedisClient()

      client.hmget(['list:' + listName, ...fields], (err, results) => {
        if (err) {
          throw new Error('5300')
        }
        resolve(results.map(result => JSON.parse(result)))
      })
    }
    catch (err) {
      reject(err)
    }
  })
}
