const client = require('../redis/client')

module.exports = (key) => {
  return new Promise((resolve, reject) => {
    client.get(key, (err, result) => {
      if (err) {
        err.code = '5300'
        reject(err)
      }
      else {
        resolve(JSON.parse(result))
      }
    })
  })
}
