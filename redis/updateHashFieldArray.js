const client = require('./client')
const scripts = require('../lua/scripts')

module.exports = (instance, command, field, value, index = 0) => {
  return new Promise((resolve, reject) => {
    try {
      if (!instance || typeof instance !== 'string') {
        throw new Error('Invalid instance: ' + instance)
      }
      else if (!field || typeof field !== 'string') {
        throw new Error('Invalid field: ' + field)
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
