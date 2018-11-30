const axios = require('axios')
const createAuthToken = require('./createAuthToken')

async function informGame(instance, game, method, route, priority = 0) {
  try {
    const authToken = createAuthToken(
      {
        playerId: '',
        game: game,
        instance: instance,
        fromManager: true
      },
      '5m'
    )

    let url
    if (process.env.NODE_ENV === 'development') {
      url = 'http://localhost:8080/api/' + route
    } else if (process.env.NODE_ENV === 'staging') {
      url = 'https://staging.raincrowstudios.xyz/api/' + route
    } else {
      url = 'https://ai.raincrowstudios.xyz/api/' + route
    }

    await axios({
      method: method,
      url: url,
      headers: { Authorization: 'bearer ' + authToken },
      timeout: 20000
    })

    return true
  } catch (err) {
    if (priority) {
      await informGame(instance, game, method, route, priority)
    } else if (
      err.code === 'ECONNREFUSED' ||
      err.code === 'ECONNRESET' ||
      err.code === 'EBUSY'
    ) {
      return true
    }
    return err
  }
}

module.exports = informGame
