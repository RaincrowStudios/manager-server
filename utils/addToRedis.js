const client = require('../redis/client')

module.exports = (key, value) => {
  return new Promise((resolve, reject) => {
    client.set([key, JSON.stringify(value)], (err) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(true)
      }
    })
  })
}
