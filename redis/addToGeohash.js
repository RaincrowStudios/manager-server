const client = require('./client')

module.exports = (category, instance, coords) => {
  return new Promise((resolve, reject) => {
    if (!category || typeof category !== 'string') {
      const err = 'Invalid category: ' + category
      reject(err)
    }
    else if (!instance || typeof instance !== 'string') {
      const err = 'Invalid instance: ' + instance
      reject(err)
    }
    else if (typeof coords[0] !== 'number' && typeof coords[1] !== 'number') {
      const err = 'Invalid coords: ' + coords[0] + ', ' + coords[1]
      reject(err)
    }

    client.geoadd(
      ['geohash:' + category, coords[1], coords[0], instance],
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
