const client = require('./client')

module.exports = (region, category, xp, instance) => {
  return new Promise((resolve, reject) => {
    try {
      if (!region || typeof region !== 'string') {
        throw new Error('Invalid region: ' + region)
      }
      else if (!category || typeof category !== 'string') {
        throw new Error('Invalid category: ' + category)
      }
      else if (!xp || typeof xp !== 'number') {
        throw new Error('Invalid xp: ' + xp)
      }
      else if (!instance || typeof instance !== 'string') {
        throw new Error('Invalid instance: ' + instance)
      }

      client.zincrby(['leaderboard:' + region + ':' + category, xp, instance],
        (err) => {
          if (err) {
            throw new Error(err)
          }
          else {
            resolve(true)
          }
        }
      )
    }
    catch (err) {
      reject(err)
    }
  })
}
