const client = require('./client')

module.exports = (instance, object) => {
  return new Promise((resolve, reject) => {
    try {
      if (!instance || typeof instance !== 'string') {
        const err = 'Invalid instance: ' + instance
        throw err
      }
      else if (!object || typeof object !== 'object') {
        const err = 'Invalid object: ' + object
        throw err
      }

      const fieldsValues = []
      const keys = Object.keys(object)
      for (const key of keys) {
        fieldsValues.push(key, JSON.stringify(object[key]))
      }

      client.hmset([instance, ...fieldsValues], (err) => {
        if (err) {
          reject(err)
        }
        else {
          resolve(true)
        }
      })
    }
    catch (err) {
      reject(err)
    }
  })
}
