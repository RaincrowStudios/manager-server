const client = require('./client')

module.exports = (instance, fields, values) => {
  return new Promise((resolve, reject) => {
    try {
      if (!instance || typeof instance !== 'string') {
        throw new Error('Invalid instance: ' + instance)
      }
      else if (!fields || !Array.isArray(fields)) {
        throw new Error('Invalid fields: ' + fields)
      }
      else if (!values || !Array.isArray(values)) {
        throw new Error('Invalid values: ' + values)
      }
      else if (fields.length !== values.length) {
        throw new Error('Fields and values must be the same length')
      }

      const fieldsValues = []
      for (let i = 0; i < fields.length; i++) {
        fieldsValues.push(fields[i], JSON.stringify(values[i]))
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
