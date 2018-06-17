const selectClient = require('./selectClient')

module.exports = (channel, message) => {
  return new Promise(async (resolve, reject) => {
    try {
      const client = selectClient()

      client.publish(channel, JSON.stringify(message))
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
