const client = require('../redis/client')
const scripts = require('../lua/scripts')

module.exports = (character, region, xp, coven = '') => {
  return new Promise((resolve, reject) => {
    try {
      if (!character || typeof character !== 'string') {
        throw new Error('Invalid character: ' + character)
      }
      else if (!region || typeof region !== 'string') {
        throw new Error('Invalid region: ' + region)
      }
      else if (!xp || typeof xp !== 'number') {
        throw new Error('Invalid xp: ' + xp)
      }
      else if (coven) {
        if (typeof coven !== 'string') {
          throw new Error('Invalid coven: ' + coven)
        }
      }

      client.multi()
      .evalsha([scripts.addExperience.sha, 1, character, xp])
      .zincrby(['leaderboard:world:character', xp, character])
      .zincrby(['leaderboard:' + region + ':character', xp, character])

      if (coven) {
        client.zincrby(['leaderboard:world:coven', xp, coven])
        .zincrby(['leaderboard:' + region + ':coven', xp, coven])
      }

      client.exec((err, results) => {
        if (err) {
          throw new Error(err)
        }
        else {
          resolve(JSON.parse(results[0]))
        }
      })
    }
    catch (err) {
      reject(err)
    }
  })
}
