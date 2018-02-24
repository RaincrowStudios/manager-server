const client = require('../redis/client')

module.exports = (key, latitude, longitude, radius) => {
	return new Promise((resolve, reject) => {
    client.georadius([key, longitude, latitude, radius, 'km', 'WITHCOORD'],
      (err, results) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(results)
      }
    })
  })
}
