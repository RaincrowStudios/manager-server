const initializer = require('../initializer/initializer')
const client = require('../redis/client')
const subscriber = require('../redis/subscriber')
const scripts = require('./scripts')
const lured = require('lured').create(client, scripts)

module.exports = () => {
  lured.load(async err => {
    if (err) {
      //contact admin
    }
    else {
      console.log('Lua scripts loaded to Redis')
      await subscriber()
      initializer()
    }
  })
}
