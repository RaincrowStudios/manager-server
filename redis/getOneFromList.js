const selectRedisClient = require('./selectRedisClient')

module.exports = (listName, field) => {
  return new Promise((resolve, reject) => {
    try {
      if (!listName || typeof listName !== 'string') {
        throw new Error('Invalid list: ' + listName)
      }
      else if (!field || typeof field !== 'string') {
        throw new Error('Invalid field: ' + field)
      }

      const client = selectRedisClient()

      client.hget(['list:' + listName, field], (err, results) => {
        if (err) {
          throw new Error('5300')
        }
        else {
          resolve(JSON.parse(results))
        }
      })
    }
    catch (err) {
      reject(err)
    }
  })
}
