const axios = require('axios')
const createToken = require('./createToken')

module.exports = (instance, game, method, route) => {
  const authToken = createToken(
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
  else {
    url = 'https://raincrowstudios.xyz/api/' + route
  }

  return axios(
    {
      method: method,
      url: url,
      headers: {'Authorization': 'bearer ' + authToken},
    }
  )
}
