const client = require('./client')
const scripts = require('../lua/scripts')

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
        throw new Error('Invalid values: ' + value)
      }

      client.evalsha(
        [scripts.updateHashField.sha, 1, instance, field, JSON.stringify(value)],
        (err, result) => {
        if (err) {
          throw new Error(err)
        }
        else {
          resolve(result)
        }
      })
    }
    catch (err) {
      reject(err)
    }
  })
}
