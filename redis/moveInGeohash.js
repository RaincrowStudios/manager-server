const client = require('./client')
const scripts = require('../lua/scripts')

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

      client.evalsha(
        [
          scripts.moveInGeohash.sha,
          1, 'geo:' + category,
          latitude,
          longitude,
          instance
        ],
        (err, result) => {
          if (err) {
            console.log(category, instance, latitude, longitude)
            throw new Error(err)
          }
          else {
            resolve(result)
          }
        }
      )
    }
    catch (err) {
      reject(err)
    }
  })
}
