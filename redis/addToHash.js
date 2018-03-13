const client = require('./client')

module.exports = (instance, fields, values) => {
  return new Promise((resolve, reject) => {
    if (!instance || typeof instance !== 'string') {
      const err = 'Invalid instance: ' + instance
      reject(err)
    }
    else if (fields.length !== values.length) {
      const err = 'Fields and values must be the same length'
      reject(err)
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
  })
}
