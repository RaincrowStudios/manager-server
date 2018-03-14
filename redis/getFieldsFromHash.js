const client = require('./client')

module.exports = (category, instance, fields) => {
  return new Promise((resolve, reject) => {
    if (!category || typeof category !== 'string') {
      const err = 'Invalid category: ' + category
      reject(err)
    }
    else if (!instance || typeof instance !== 'string') {
      const err = 'Invalid instance: ' + instance
      reject(err)
    }

    client.hmget(
      ['hash:' + category + ':' + instance, ...fields],
      (err, results) => {
        if (err) {
          err.code = '5300'
          reject(err)
        }
        let object = {}
        if (results) {
          for (const keyValue of Object.entries(results)) {
            object[keyValue[0]] = JSON.parse(keyValue[1])
          }
        }
        resolve(object)
      }
    )
  })
}
