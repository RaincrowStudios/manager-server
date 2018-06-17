const selectRedisClient = require('./selectRedisClient')

module.exports = (category, latitude, longitude, radius, count = 0) => {
	return new Promise((resolve, reject) => {
		try {
			if (!category || typeof category !== 'string') {
				throw new Error('Invalid category: ' + category)
			}

			else if (typeof latitude !== 'number' && typeof longitude !== 'number') {
				throw new Error('Invalid coords: ' + latitude + ', ' + longitude)
			}

			const client = selectRedisClient()

			let query = ['geo:' + category, longitude, latitude, radius, 'km']
			if (count > 0) {
				query.push('COUNT')
				query.push(count)
			}
			client.georadius(query, (err, results) => {
				if (err) {
					throw new Error(err)
				}
				else {
					resolve(results)
				}
			})
		}
		catch (err) {
			reject(err)
		}
  })
}
