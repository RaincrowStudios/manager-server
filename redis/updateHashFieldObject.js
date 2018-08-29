const selectRedisClient = require('./selectRedisClient')
const scripts = require('../lua/scripts')

module.exports = (instance, command, field, key, value = {}) => {
  return new Promise((resolve, reject) => {
    try {
      if (!instance || typeof instance !== 'string') {
        throw new Error('Invalid instance: ' + instance)
      }
      else if (!command || typeof command !== 'string') {
        throw new Error('Invalid command: ' + command)
      }
      else if (!field || typeof field !== 'string') {
        throw new Error('Invalid field: ' + field)
      }
      else if (!key || typeof key !== 'string') {
        throw new Error('Invalid key: ' + key)
      }
      else if (value === undefined) {
        throw new Error('Invalid value: ' + value)
      }

      const client = selectRedisClient(instance)

      client.evalsha(
        [
          scripts.updateHashFieldObject.sha,
          1,
          instance,
          command,
          field,
          key,
          JSON.stringify(value)
        ],
        (err, result) => {
          if (err) {
            throw new Error(err)
          }
          else {
            resolve(JSON.parse(result))
          }
        }
      )
    }
    catch (err) {
      reject(err)
    }
  })
}
