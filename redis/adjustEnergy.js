const client = require('./client')
const scripts = require('../lua/scripts')

module.exports = (instance, energy) => {
  return new Promise((resolve, reject) => {
    try {
      if (!instance || typeof instance !== 'string') {
        throw new Error('Invalid instance: ' + instance)
      }
      else if (typeof energy !== 'number') {
        throw new Error('Invalid energy: ' + energy)
      }

      client.evalsha(
        [scripts.adjustEnergy.sha, 1, instance, energy],
        (err, result) => {
          if (err) {
            throw new Error(err)
          }
          else {
            resolve(JSON.parse(result))
          }
        }
      )
    }
    catch (err) {
      reject(err)
    }
  })
}
