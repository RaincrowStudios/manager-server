const client = require('./client')

module.exports = (instance) => {
  return new Promise((resolve, reject) => {
    if (!instance || typeof instance !== 'string') {
      const err = 'Invalid instance: ' + instance
      reject(err)
    }
    
    client.del(instance, (err) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(true)
      }
    })
  })
}
