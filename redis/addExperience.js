const client = require('./client')
const scripts = require('../lua/scripts')
const adjustLeaderboards = require('../utils/adjustLeaderboards')

module.exports = (character, region, xp, coven = '') => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!character || typeof character !== 'string') {
        throw new Error('Invalid character: ' + character)
      }
      else if (!region || typeof region !== 'string') {
        throw new Error('Invalid region: ' + region)
      }
      else if (typeof xp !== 'number') {
        throw new Error('Invalid xp: ' + xp)
      }
      else if (coven) {
        if (typeof coven !== 'string') {
          throw new Error('Invalid coven: ' + coven)
        }
      }

      await adjustLeaderboards(character, region, 'witch', xp, coven)

      client.evalsha(
        [scripts.addExperience.sha, 1, character, xp],
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
