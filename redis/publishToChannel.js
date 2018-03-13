const client = require('./client')

module.exports = (channel, message) => {
  return new Promise(async (resolve, reject) => {
    try {
      client.publish(channel, JSON.stringify(message))
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
