const client = require('./client')
const scripts = require('../lua/scripts')

module.exports = (instance, command, field, value, index = 0) => {
  return new Promise((resolve, reject) => {
    try {
      if (!instance || typeof instance !== 'string') {
        const err = 'Invalid instance: ' + instance
        throw err
      }
      else if (!field || typeof field !== 'string') {
        const err = 'Invalid field: ' + field
        throw err
      }

      client.evalsha(
        [
          scripts.updateHashFieldArray.sha,
          1,
          instance,
          command,
          field,
          JSON.stringify(value),
          index
        ],
        (err, result) => {
          if (err) {
            reject(err)
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
