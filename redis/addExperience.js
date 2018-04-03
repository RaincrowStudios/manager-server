const client = require('./client')
const scripts = require('../lua/scripts')

module.exports = (instance, xp) => {
  return new Promise((resolve, reject) => {
    try {
      if (!instance || typeof instance !== 'string') {
        const err = { message: 'Invalid instance: ' + instance }
        throw err
      }

      client.evalsha([scripts.addExperience.sha, 1, instance, xp], (err, result) => {
        if (err) {
          reject(err)
        }
        else {
          resolve(result)
        }
      })
    }
    catch (err) {
      reject(err)
    }
  })
}
