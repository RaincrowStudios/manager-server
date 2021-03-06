const selectRedisClient = require('./selectRedisClient')

module.exports = (category, latitude, longitude, radius, count = 0) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!category || typeof category !== 'string') {
        throw new Error('Invalid category: ' + category)
      } else if (
        typeof latitude !== 'number' ||
        typeof longitude !== 'number' ||
        (isNaN(latitude) || isNaN(longitude))
      ) {
        throw new Error('Invalid coords: ' + latitude + ', ' + longitude)
      } else if (typeof radius !== 'number' || isNaN(radius)) {
        throw new Error('Invalid radius: ' + radius)
      }

      const client = await selectRedisClient()

      let query = ['geo:' + category, longitude, latitude, radius, 'm']
      if (count > 0) {
        query.push('COUNT')
        query.push(count)
      }
      client.georadius(query, (err, results) => {
        if (err) {
          throw new Error(err)
        } else {
          resolve(results)
        }
      })
    } catch (err) {
      reject(err)
    }
  })
}
