const axios = require('axios')
const key = require('../keys/keys')
const getOneFromList = require('../redis/getOneFromList')

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

      console.log(address.data.results)

      const country = address.data.results
        .filter(result => result.types.includes('country'))[0]

      console.log(country)

      if (country) {
        const code = country.address_components[0].short_name.toLowerCase()
        const spawnZone = await getOneFromList('countries', code)

        if (typeof spawnZone === 'number' && !isNaN(spawnZone)) {
          const spawnList = await getOneFromList('zones', spawnZone.toString())
          resolve(spawnList)
        }
      }
      else {
        resolve(false)
      }
    }
    catch (err) {
      reject(err)
    }
  })
}
