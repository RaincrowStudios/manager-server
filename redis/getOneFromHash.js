const client = require('./client')

module.exports = (category, instance, field) => {
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

    client.hget(
      ['hash:' + category + ':' + instance, field],
      (err, results) => {
        if (err) {
          err.code = '5300'
          reject(err)
        }
        else {
          resolve(JSON.parse(results))
        }
      }
    )
  })
}
