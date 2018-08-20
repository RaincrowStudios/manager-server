const publishToChannel = require('../redis/publishToChannel')

module.exports = (message) => {
  return new Promise((resolve, reject) => {
    try {
      resolve(
        publishToChannel(
          'logger',
          message
        )
      )
    }
    catch (err) {
      reject(err)
    }
  })
}
