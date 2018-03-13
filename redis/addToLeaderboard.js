const client = require('../redis/client')

module.exports = (dominion, instance, score) => {
  return new Promise((resolve, reject) => {
    if (!dominion || typeof category !== 'string') {
      const err = 'Invalid category: ' + dominion
      reject(err)
    }
    else if (!instance || typeof instance !== 'string') {
      const err = 'Invalid instance: ' + instance
      reject(err)
    }

    client.zadd(['leaderboard:character:' + dominion, score, instance], (err) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(true)
      }
    })
  })
}
