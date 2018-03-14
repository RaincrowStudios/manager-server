const client = require('./client')

module.exports = (category, instance, latitude, longitude) => {
  return new Promise((resolve, reject) => {
    if (!category || typeof category !== 'string') {
      const err = 'Invalid category: ' + category
      reject(err)
    }
    else if (!instance || typeof instance !== 'string') {
      const err = 'Invalid instance: ' + instance
      reject(err)
    }
    else if (typeof latitude !== 'number' && typeof longitude !== 'number') {
      const err = 'Invalid coords: ' + latitude + ', ' + longitude
      reject(err)
    }

    client.geoadd(
      ['geohash:' + category, longitude, latitude, instance],
      (err) => {
        if (err) {
          reject(err)
        }
        else {
          resolve(true)
        }
      }
    )
  })
}
