const client = require('./client')

module.exports = (category, region, instance, score) => {
  return new Promise((resolve, reject) => {
    try {
      if (!category || typeof category !== 'string') {
        const err = 'Invalid category: ' + category
        throw err
      }
      else if (!region || typeof region !== 'string') {
        const err = 'Invalid region: ' + region
        throw err
      }
      else if (!instance || typeof instance !== 'string') {
        const err = 'Invalid instance: ' + instance
        throw err
      }

      client.zadd(
        ['set:leaderboard:' + category + ':' + region, score, instance],
        (err) => {
          if (err) {
            reject(err)
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
