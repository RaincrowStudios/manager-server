const client = require('./client')

module.exports = (category, instance, object) => {
  return new Promise((resolve, reject) => {
    if (!category || typeof category !== 'string') {
      const err = 'Invalid category: ' + category
      reject(err)
    }
    else if (!instance || typeof instance !== 'string') {
      const err = 'Invalid instance: ' + instance
      reject(err)
    }
    else if (!object || typeof instance !== 'object') {
      const err = 'Invalid object: ' + object
      reject(err)
    }

    const fieldsValues = []
    const keys = Object.keys(object)
    for (const key of keys) {
      fieldsValues.push(key, JSON.stringify(object[key]))
    }

    client.hmset(
      ['hash:' + category + ':' + instance, ...fieldsValues],
      (err) => {
        if (err) {
          reject(err)
        }
        else {
          resolve(true)
        }
      }
    )
  })
}
