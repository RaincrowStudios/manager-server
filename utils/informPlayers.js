const client = require('../redis/client')

module.exports = (players, payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      client.publish(
        'players',
        JSON.stringify(
          {
            players: players,
            payload: payload
          }
        )
      )
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
