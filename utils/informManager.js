const axios = require('axios')
const createAuthToken = require('./createAuthToken')

module.exports = async message => {
  const authToken = createAuthToken(
    {
      fromGame: true,
      message: message
    },
    '1m'
  )

  let url
  if (process.env.NODE_ENV === 'development') {
    url = 'http://localhost:8082/'
  } else if (process.env.NODE_ENV === 'staging') {
    url = 'https://staging.raincrowstudios.xyz/manager'
  } else {
    url = 'https://raincrowstudios.xyz/manager'
  }

  await axios({
    method: 'HEAD',
    url: url,
    headers: { Authorization: 'bearer ' + authToken }
  })

  return true
}
