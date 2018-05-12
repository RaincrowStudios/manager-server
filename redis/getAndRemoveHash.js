const client = require('./client')

module.exports = (instance) => {
  return new Promise((resolve, reject) => {
    try {
      if (!instance || typeof instance !== 'string') {
        throw new Error('Invalid instance: ' + instance)
      }

      client.multi()
        .hgetall([instance])
        .del([instance])
        .exec((err, results) => {
          if (err) {
            throw new Error(err)
          }
          else {
            resolve(results[0])
          }
        }
      )
    }
    catch (err) {
      reject(err)
    }
  })
}
