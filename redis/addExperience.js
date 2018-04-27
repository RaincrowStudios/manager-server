const client = require('./client')
const scripts = require('../lua/scripts')

module.exports = (instance, xp) => {
  return new Promise((resolve, reject) => {
    try {
      if (!instance || typeof instance !== 'string') {
        throw new Error('Invalid instance: ' + instance)
      }

      client.evalsha([scripts.addExperience.sha, 1, instance, xp], (err, result) => {
        if (err) {
          reject(err)
        }
        else {
          resolve(JSON.parse(result))
        }
      })
    }
    catch (err) {
      reject(err)
    }
  })
}
