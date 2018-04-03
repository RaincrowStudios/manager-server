const client = require('./client')

module.exports = (category, member, radius, count = 0) => {
  return new Promise((resolve, reject) => {
    try {
      if (!category || typeof category !== 'string') {
        const err = 'Invalid category: ' + category
        throw err
      }
      else if (!member || typeof member !== 'string') {
        const err = 'Invalid member: ' + member
        throw err
      }

      let query = ['geo:' + category, member, radius, 'km']
      if (count > 0) {
        query.push('COUNT')
        query.push(count)
      }

      client.georadiusbymember(query, (err, results) => {
        if (err) {
          reject(err)
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
