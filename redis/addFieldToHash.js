const selectRedisClient = require('./selectRedisClient')

module.exports = (instance, field, value) => {
  return new Promise((resolve, reject) => {
    try {
      if (!instance || typeof instance !== 'string') {
        throw new Error('Invalid instance: ' + instance)
      }
      else if (!field || typeof field !== 'string') {
        throw new Error('Invalid field: ' + field)
      }
      else if (value === undefined) {
        throw new Error('Invalid value: ' + value)
      }

      const client = selectRedisClient(instance)

      client.hmset([instance, field, JSON.stringify(value)], (err) => {
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
