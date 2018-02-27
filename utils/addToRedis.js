const client = require('../redis/client')

module.exports = (key, fields, values) => {
  let update = []
  for (let i = 0; i < fields.length; i++) {
    update.push(fields[i], JSON.stringify(values[i]))
  }
  return new Promise((resolve, reject) => {
    client.hmset([key, ...update],
      (err, result) => {
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
