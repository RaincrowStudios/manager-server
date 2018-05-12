const client = require('./client')

module.exports = (category, member) => {
  return new Promise((resolve, reject) => {
    try {
      if (!category || typeof category !== 'string') {
        throw new Error('Invalid category: ' + category)
      }
      else if (!member || typeof member !== 'string') {
        throw new Error('Invalid member: ' + member)
      }

      client.geopos(['geo:' + category, member], (err, results) => {
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
