const client = require('./client')

module.exports = (category, region, instance, score) => {
  return new Promise((resolve, reject) => {
    try {
      if (!category || typeof category !== 'string') {
        throw new Error('Invalid category: ' + category)
      }
      else if (!region || typeof region !== 'string') {
        throw new Error('Invalid region: ' + region)
      }
      else if (!instance || typeof instance !== 'string') {
        throw new Error('Invalid instance: ' + instance)
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
