const client = require('./client')

module.exports = (category, instance, latitude, longitude) => {
  return new Promise((resolve, reject) => {
    try {
      if (!category || typeof category !== 'string') {
        const err = 'Invalid category: ' + category
        throw err
      }
      else if (!instance || typeof instance !== 'string') {
        const err = 'Invalid instance: ' + instance
        throw err
      }
      else if (typeof latitude !== 'number' && typeof longitude !== 'number') {
        const err = 'Invalid coords: ' + latitude + ', ' + longitude
        throw err
      }

      client.geoadd(['geo:' + category, longitude, latitude, instance], (err) => {
        if (err) {
          reject(err)
        }
        else {
          resolve(true)
        }
      })
    }
    catch (err) {
      reject(err)
    }
  })
}
