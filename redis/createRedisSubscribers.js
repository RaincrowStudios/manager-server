const ping = require('ping')
const redis = require('redis')
const ips = require('../config/region-ips')
const manager = require('../manager/manager')

module.exports = () => {
  return new Promise((resolve, reject) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        const subscriber = redis.createClient(
          6379,
          'localhost'
        )

        subscriber.on('ready', () => {
          subscriber.subscribe('manager')
        })

        subscriber.on('message', (channel, message) => {
          manager(JSON.parse(message))
        })

        subscriber.on('error', (err) => {
          throw new Error(err)
        })
      }
      else {
        Object.keys(ips).forEach(region => {
          const host = '10.' + ips[region] + '.1.255'

          ping.sys.probe(host, (isAlive) => {
            console.log(isAlive)
            if (isAlive) {
              const subscriber = redis.createClient(
                6379,
                host
              )

              subscriber.on('ready', () => {
                console.log('Subscriber ready')
                subscriber.subscribe('manager')
              })

              subscriber.on('message', (channel, message) => {
                console.log('Message from subscriber')
                manager(JSON.parse(message))
              })

              subscriber.on('error', err => {
                throw new Error(err)
              })
            }
          })
        })
      }
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
