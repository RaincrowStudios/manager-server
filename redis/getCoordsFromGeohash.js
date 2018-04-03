const client = require('./client')

module.exports = (category, member) => {
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
      
      client.geopos(['geo:' + category, member], (err, results) => {
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
