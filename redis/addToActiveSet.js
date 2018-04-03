const client = require('./client')

module.exports = (category, instance) => {
  return new Promise((resolve, reject) => {
    try {
      if (!category || typeof category !== 'string') {
        const err = 'Invalid category: ' + category
        throw err
      }
      else if (!instance || typeof instance !== 'string') {
        const err = 'Invalid instance: ' + instance
        throw err
      }

      client.zadd(['set:active:' + category, Date.now(), instance], (err) => {
        if (err) {
          reject(err)
        }
        else {
          resolve(true)
        }
      })
    }
    catch (err) {
      reject(err)
    }
  })
}
