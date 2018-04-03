const client = require('./client')
const scripts = require('../lua/scripts')

module.exports = (instance, energy) => {
  return new Promise((resolve, reject) => {
    try {
      if (!instance || typeof instance !== 'string') {
        const err = 'Invalid instance: ' + instance
        throw err
      }

      client.evalsha(
        [scripts.adjustEnergy.sha, 1, instance, energy],
        (err, result) => {
          if (err) {
            reject(err)
          }
          else {
            resolve(result)
          }
        }
      )
    }
    catch (err) {
      reject(err)
    }
  })
}
