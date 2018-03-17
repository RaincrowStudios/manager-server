const client = require('./client')
const scripts = require('../lua/scripts')

module.exports = (category, instance, command, field, value, index = 0) => {
  return new Promise((resolve, reject) => {
    if (!category || typeof category !== 'string') {
      const err = 'Invalid category: ' + category
      reject(err)
    }
    else if (!instance || typeof instance !== 'string') {
      const err = 'Invalid instance: ' + instance
      reject(err)
    }
    else if (!field || typeof field !== 'string') {
      const err = 'Invalid field: ' + field
      reject(err)
    }

    const key = 'hash:' + category + ':' + instance

    client.evalsha(
      [
        scripts.updateHashFieldArray.sha,
        1,
        key,
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
  })
}
