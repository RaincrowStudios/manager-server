const client = require('../redis/client')

module.exports = (key, instance, latitude, longitude) => {
  return new Promise((resolve, reject) => {
    client.geoadd([key, longitude, latitude, instance], (err) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(true)
      }
    })
  })
}
