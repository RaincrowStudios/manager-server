const client = require('./client')

module.exports = (category, instance, field, increment) => {
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
    else if (!increment || typeof increment !== 'number') {
      const err = 'Invalid increment: ' + increment
      reject(err)
    }

    client.hincrby(
      ['hash:' + category + ':' + instance, field, increment],
      (err, result) => {
        if (err) {
          reject(err)
        }
        else {
          resolve(result)
        }
      }
    )
  })
}
