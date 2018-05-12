const client = require('./client')

module.exports = (category, member, radius, count = 0) => {
  return new Promise((resolve, reject) => {
    try {
      if (!category || typeof category !== 'string') {
        throw new Error('Invalid category: ' + category)
      }
      else if (!member || typeof member !== 'string') {
        throw new Error('Invalid member: ' + member)
      }

      let query = ['geo:' + category, member, radius, 'km']
      if (count > 0) {
        query.push('COUNT')
        query.push(count)
      }

      client.georadiusbymember(query, (err, results) => {
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
