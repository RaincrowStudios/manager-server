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

    client.multi()
    .hgetall('hash:' + category + ':' + instance)
    .del('hash:' + category + ':' + instance)
    .exec((err, results) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(results[0])
      }
    })
  })
}
