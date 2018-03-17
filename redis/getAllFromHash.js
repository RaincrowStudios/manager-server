const client = require('./client')

module.exports = (category, instance) => {
  return new Promise((resolve, reject) => {
    if (!category || typeof category !== 'string') {
      const err = 'Invalid category: ' + category
      reject(err)
    }
    else if (!instance || typeof instance !== 'string') {
      const err = 'Invalid instance: ' + instance
      reject(err)
    }

    client.hgetall(['hash:' + category + ':' + instance], (err, results) => {
      if (err) {
        err.code = '5300'
        reject(err)
      }
      else {
        if (results) {
          let object = {}
          for (const keyValue of Object.entries(results)) {
            object[keyValue[0]] = JSON.parse(keyValue[1])
          }
          resolve(object)
        }
        else {
          resolve(null)
        }
      }
    })
  })
}
