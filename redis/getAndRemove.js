const client = require('./client')

module.exports = (instance) => {
  return new Promise((resolve, reject) => {
    if (!instance || typeof instance !== 'string') {
      const err = 'Invalid instance: ' + instance
      reject(err)
    }

    client.multi()
    .hgetall(instance)
    .del(instance)
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
