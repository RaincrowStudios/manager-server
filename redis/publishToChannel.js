const selectRedisClient = require('./selectRedisClient')

module.exports = (channel, message) => {
  return new Promise(async (resolve, reject) => {
    try {
      const client = selectRedisClient()

      client.publish(channel, JSON.stringify(message))
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
