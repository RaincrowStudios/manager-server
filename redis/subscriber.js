const fs = require('fs')
const redis = require('redis')
const redisConfigJSON =
  process.env.NODE_ENV === 'development' ?
    fs.readFileSync('redis-key/test-keys.json') :
    fs.readFileSync('redis-key/test-keys.json')
const redisConfig = JSON.parse(redisConfigJSON)

const subscriber = redis.createClient(
  redisConfig.redisPort,
  redisConfig.redisHost
)

subscriber.auth(redisConfig.redisKey, (err) => {
    if (err) throw err
})

subscriber.on('ready', () => {
  console.log("Redis Subscriber ready")
})

subscriber.on('error', (err) => {
  console.log("Error in Redis Subscriber", err)
})

module.exports = subscriber
