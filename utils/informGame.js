const axios = require('axios')
const createAuthToken = require('./createAuthToken')

module.exports = async (instance, game, method, route) => {
  try {
    const authToken = createAuthToken(
      {
        playerId: '',
        game: game,
        instance: instance,
        fromManager: true
      },
      '1m'
    )

    let url
    if (process.env.NODE_ENV === 'development') {
      url = 'http://localhost:8080/api/' + route
    }
    else if (process.env.NODE_ENV === 'staging') {
      url = 'https://staging.raincrowstudios.xyz/api/' + route
    }
    else {
      url = 'https://raincrowstudios.xyz/api/' + route
    }

    await axios(
      {
        method: method,
        url: url,
        headers: {'Authorization': 'bearer ' + authToken},
      }
    )

    return true
  }
  catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
      return true
    }
    return err
  }
}
