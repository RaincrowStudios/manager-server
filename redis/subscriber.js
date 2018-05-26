const redis = require('redis')
const manager = require('../manager/manager')
const keys = require('../keys')

function subscriber() {
  const subscriber = redis.createClient(
    keys.redis.port,
    keys.redis.host
  )

  subscriber.auth(keys.redis.key, err => {
    if (err) {
      throw new Error(err)
    }
  })

  subscriber.on('ready', () => {
    console.log('Worker %d subscribed to Redis', process.pid)
  })

  subscriber.on('error', err => {
    //contact admin
    console.log('Error in Redis Subscriber', err)
  })

  subscriber.on('message', ((channel, message) => {
      manager(JSON.parse(message))
    })
  )

  subscriber.subscribe('manager')
}
module.exports = subscriber
