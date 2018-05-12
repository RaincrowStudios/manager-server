const client = require('./client')

module.exports = (category, instance, latitude, longitude) => {
  return new Promise((resolve, reject) => {
    try {
      if (!category || typeof category !== 'string') {
        throw new Error('Invalid category: ' + category)
      }
      else if (!instance || typeof instance !== 'string') {
        throw new Error('Invalid instance: ' + instance)
      }
      else if (typeof latitude !== 'number' && typeof longitude !== 'number') {
        throw new Error('Invalid coords: ' + latitude + ', ' + longitude)
      }

      client.geoadd(['geo:' + category, longitude, latitude, instance], (err) => {
        if (err) {
          throw new Error(err)
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
