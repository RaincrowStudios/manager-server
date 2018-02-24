const client = require('../redis/client')

module.exports = (key) => {
  return new Promise((resolve, reject) => {
    client.zrange([key, 0, -1], (err, results) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(results)
      }
    })
  })
}
