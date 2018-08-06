const publishToChannel = require('../redis/publishToChannel')

module.exports = (message, error = false) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (error) {
        await publishToChannel(
          'logger',
          {error_code: message.message, source: 'game-server', content: message.stack}
        )
      }
      else {
        await publishToChannel(
          'logger',
          message
        )
      }
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
