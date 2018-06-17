const axios = require('axios')
const key = require('../keys/keys')

module.exports = (latitude, longitude) => {
  return new Promise(async (resolve, reject) => {
    try {
      const address = await axios(
        'https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
        latitude +
        ',' +
        longitude +
        '&key=' +
        key.google
      )
      const country = address.data.results
        .filter(result =>
          result.types.includes('country')
        )[0]

      let dominion
      if (country) {
        dominion = country.address_components[0].long_name
      }
      else {
        dominion = false
      }

      if (!dominion) {
        dominion = false
      }

        resolve(dominion)
      }
      catch (err) {
        reject(err)
      }
    })
  }
