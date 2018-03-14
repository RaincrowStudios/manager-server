const client = require('./client')

module.exports = (category, latitude, longitude, radius, count = 0) => {
	return new Promise((resolve, reject) => {
		if (!category || typeof category !== 'string') {
			const err = 'Invalid category: ' + category
			reject(err)
		}

		else if (typeof latitude !== 'number' && typeof longitude !== 'number') {
			const err = 'Invalid coords: ' + latitude + ', ' + longitude
			reject(err)
		}

    let query = ['geohash:' + category, longitude, latitude, radius, 'km']
    if (count > 0) {
      query.push('COUNT')
      query.push(count)
    }
    client.georadius(query, (err, results) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(results)
      }
    })
  })
}
