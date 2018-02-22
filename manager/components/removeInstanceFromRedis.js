const client = require('../../redis/client')

module.exports = (key) => {
  return new Promise((resolve, reject) => {
    client.del(key, (err) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(true)
      }
    })
  })
}
