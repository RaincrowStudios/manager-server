const client = require('./client')

module.exports = (keys) => {
  lured.load((err) => {
    client.evalsha(lua.find.sha, 2, GEO, HASH, BERKELEY.lon, BERKELEY.lat, (err, data) => {

    })
  })
}
