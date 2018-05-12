const client = require('./client')

module.exports = (instance, object) => {
  return new Promise((resolve, reject) => {
    try {
      if (!instance || typeof instance !== 'string') {
        throw new Error('Invalid instance: ' + instance)
      }
      else if (!object || typeof object !== 'object') {
        throw new Error('Invalid object: ' + object)
      }

      const fieldsValues = []
      const keys = Object.keys(object)
      for (const key of keys) {
        fieldsValues.push(key, JSON.stringify(object[key]))
      }

      client.hmset([instance, ...fieldsValues], (err) => {
        if (err) {
          throw new Error(err)
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
