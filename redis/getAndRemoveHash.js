const client = require('./client')

module.exports = (instance) => {
  return new Promise((resolve, reject) => {
    try {
      if (!instance || typeof instance !== 'string') {
        const err = 'Invalid instance: ' + instance
        throw err
      }

      client.multi()
      .hgetall([instance])
      .del([instance])
      .exec((err, results) => {
        if (err) {
          reject(err)
        }
        else {
          resolve(results[0])
        }
      })
    }
    catch (err) {
      reject(err)
    }
  })
}
