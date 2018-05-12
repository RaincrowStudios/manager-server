const client = require('./client')

module.exports = (category, instance) => {
  return new Promise((resolve, reject) => {
    try {
      if (!category || typeof category !== 'string') {
        throw new Error('Invalid category: ' + category)
      }
      else if (!instance || typeof instance !== 'string') {
        throw new Error('Invalid instance: ' + instance)
      }

      client
        .multi()
        .zrem(['geo:' + category, instance])
        .zrem(['set:active:' + category, instance])
        .del([instance])
        .exec(err => {
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
