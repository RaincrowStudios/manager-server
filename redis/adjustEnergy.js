const client = require('./client')
const scripts = require('../lua/scripts')

module.exports = (category, instance, energy) => {
  return new Promise((resolve, reject) => {
    if (!category || typeof category !== 'string') {
      const err = 'Invalid category: ' + category
      reject(err)
    }
    else if (!instance || typeof instance !== 'string') {
      const err = 'Invalid instance: ' + instance
      reject(err)
    }

    const key = 'hash:' + category + ':' + instance

    client.evalsha([scripts.adjustEnergy.sha, 1, key, energy], (err, results) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(JSON.parse(results))
      }
    })
  })
}
