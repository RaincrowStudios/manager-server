const client = require('./client')

module.exports = (instance, fields, values) => {
  return new Promise((resolve, reject) => {
    try {
      if (!instance || typeof instance !== 'string') {
        const err = 'Invalid instance: ' + instance
        throw err
      }
      else if (!fields || !Array.isArray(fields)) {
        const err = 'Invalid fields: ' + fields
        throw err
      }
      else if (!values || !Array.isArray(values)) {
        const err = 'Invalid values: ' + values
        throw err
      }
      else if (fields.length !== values.length) {
        const err = 'Fields and values must be the same length'
        throw err
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
