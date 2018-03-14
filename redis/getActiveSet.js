const client = require('./client')

module.exports = (category) => {
  return new Promise((resolve, reject) => {
    if (!category || typeof category !== 'string') {
      const err = 'Invalid categroy: ' + category
      reject(err)
    }

    client.zrange(['set:active:' + category, 0, -1], (err, results) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(results)
      }
    })
  })
}
