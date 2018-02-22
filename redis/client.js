const fs = require('fs')
const redis = require('redis')
const redisConfigJSON =
  process.env.NODE_ENV === 'development' ?
    fs.readFileSync('redis-key/test-keys.json') :
    fs.readFileSync('redis-key/test-keys.json')
const redisConfig = JSON.parse(redisConfigJSON)

console.log("Connecting to Redis at %s:%d", redisConfig.redisHost, redisConfig.redisPort)
const client = redis.createClient(
  redisConfig.redisPort,
  redisConfig.redisHost
)
client.auth(redisConfig.redisKey, (err) => {
    if (err) throw err
})

client.on('ready', () => {
  console.log("Redis is ready")
})

client.on('error', (err) => {
  console.log("Error in Redis", err)
})

module.exports = client
