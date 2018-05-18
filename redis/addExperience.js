const client = require('./client')
const addToLeaderboard = ('./addToLeaderboard')
const scripts = require('../lua/scripts')

module.exports = (character, region, xp, coven = '') => {
  return new Promise(async (resolve, reject) => {
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

      /*const leaderboards = [
        addToLeaderboard('world', 'character', xp, character),
        addToLeaderboard(region, 'character', xp, character)
      ]
      if (coven) {
        leaderboards.push(
          addToLeaderboard('world', 'coven', xp, coven),
          addToLeaderboard(region, 'coven', xp, coven)
        )

      }

      await Promise.all(leaderboards)*/

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
