const client = require('../redis/client')

module.exports = (category, latitude, longitude, radius) => {
	return new Promise((resolve, reject) => {
		if (!category || typeof category !== 'string') {
			const err = 'Invalid category: ' + category
			reject(err)
		}

		else if (typeof latitude !== 'number' && typeof longitude !== 'number') {
			const err = 'Invalid coords: ' + latitude + ', ' + longitude
			reject(err)
		}

    client.georadius(['geohash:' + category, longitude, latitude, radius, 'km'],
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
