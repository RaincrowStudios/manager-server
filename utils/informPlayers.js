const publishToChannel = require('../redis/publishToChannel')

module.exports = (players, payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      publishToChannel(
        'players',
        {
          players: players,
          payload: payload
        }
      )
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
