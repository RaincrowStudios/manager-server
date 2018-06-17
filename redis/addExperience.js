const selectRedisClient = require('./selectRedisClient')
const scripts = require('../lua/scripts')
const adjustLeaderboards = require('../utils/adjustLeaderboards')

module.exports = (instance, region, type, xp, coven = '') => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!instance || typeof instance !== 'string') {
        throw new Error('Invalid instance: ' + instance)
      }
      else if (!region || typeof region !== 'string') {
        throw new Error('Invalid region: ' + region)
      }
      else if (!type || typeof type !== 'string') {
        throw new Error('Invalid type: ' + type)
      }
      else if (typeof xp !== 'number') {
        throw new Error('Invalid xp: ' + xp)
      }
      else if (coven) {
        if (typeof coven !== 'string') {
          throw new Error('Invalid coven: ' + coven)
        }
      }

      const client = selectRedisClient(instance)

      await adjustLeaderboards(instance, region, type, xp, coven)

      client.evalsha(
        [scripts.addExperience.sha, 1, instance, xp],
        (err, results) => {
          if (err) {
            throw new Error(err)
          }
          else {
            resolve(JSON.parse(results))
          }
        }
      )
    }
    catch (err) {
      reject(err)
    }
  })
}
