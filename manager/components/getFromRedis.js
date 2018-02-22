const client = require('../../redis/client')

module.exports = (key, field) => {
  return new Promise((resolve, reject) => {
    client.hget([key, field], (err, result) => {
      if (err) {
        err.code = '5300'
        reject(err)
      }
      else {
        resolve(result)
      }
    })
  })
}
