const redis = require('redis')
const keys = require('../keys')

console.log("Connecting to Redis at %s:%d", keys.redis.host, keys.redis.port)
const client = redis.createClient(
  keys.redis.port,
  keys.redis.host
)
client.auth(keys.redis.key, (err) => {
  if (err) {
    throw new Error(err)
  }
})

client.on('ready', () => {
  console.log("Redis is ready")
})

client.on('error', (err) => {
  console.log("Error in Redis", err)
})

module.exports = client
