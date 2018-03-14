const client = require('./client')

module.exports = (category, name, radius, count = 0) => {
  let query = ['geohash:' + category, name, radius, 'km']
  if (count > 0) {
    query.push('COUNT')
    query.push(count)
  }
  return new Promise((resolve, reject) => {
    client.georadiusbymember(query, (err, results) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(results)
      }
    })
  })
}
