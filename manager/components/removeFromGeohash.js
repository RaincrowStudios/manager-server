const client = require('../../redis/client')

module.exports = (key, instance) => {
  return new Promise((resolve, reject) => {
    client.zrem([key, instance], (err) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(true)
      }
    })
  })
}
