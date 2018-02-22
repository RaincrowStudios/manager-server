const client = require('../../redis/client')

module.exports = (players, payload) => {
  client.publish(
    'players',
    JSON.stringify(
      {
        players: players,
        payload: payload
      }
    )
  )
}
