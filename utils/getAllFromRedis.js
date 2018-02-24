const client = require('../redis/client')

module.exports = (key) => {
  return new Promise((resolve, reject) => {
    client.hgetall(key, (err, results) => {
      if (err) {
        err.code = '5300'
        reject(err)
      }
      else {
        let object = {}
        for (const keyValue of Object.entries(results)) {
          object[keyValue[0]] = JSON.parse(keyValue[1])
        }
        resolve(object)
      }
    })
  })
}
