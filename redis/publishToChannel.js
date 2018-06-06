const client = require('./client')

module.exports = (channel, message) => {
  return new Promise(async (resolve, reject) => {
    try {
      message.sentOn = Date.now()
      client.publish(channel, JSON.stringify(message))
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
