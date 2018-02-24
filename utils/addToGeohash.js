const client = require('../redis/client')

module.exports = (key, instance, coords) => {
  return new Promise((resolve, reject) => {
    client.geoadd([key, coords[1], coords[0], instance], (error) => {
      if (error) {
        reject(error)
      }
      else {
        resolve(true)
      }
    })
  })
}
