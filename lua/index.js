const client = require('../redis/client')
const scripts = require('./scripts')
const lured = require('lured').create(client, scripts)

module.exports = lured.load(err => {
  if (err) {
    //contact admin
  }
  else {
    console.log('Lua scripts loaded to Redis')
  }
})
