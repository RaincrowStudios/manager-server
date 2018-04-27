const client = require('./client')

module.exports = (category) => {
  return new Promise((resolve, reject) => {
    try {
      if (!category || typeof category !== 'string') {
        throw new Error('Invalid categroy: ' + category)
      }

      client.zrange(['set:active:' + category, 0, -1], (err, results) => {
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
