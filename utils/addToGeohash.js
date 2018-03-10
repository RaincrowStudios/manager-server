const client = require('../redis/client')

module.exports = (key, instance, coords) => {
  return new Promise((resolve, reject) => {
    client.geoadd([key, coords[1], coords[0], instance], (err) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(true)
      }
    })
  })
}
