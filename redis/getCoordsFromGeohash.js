const client = require('./client')

module.exports = (category, member) => {
  return new Promise((resolve, reject) => {
    client.geopos(['geohash:' + category, member], (err, results) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(results)
      }
    })
  })
}
