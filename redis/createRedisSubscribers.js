const ping = require('ping')
const redis = require('redis')
const ips = require('../config/region-ips')

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

        subscriber.on('error', (err) => {
          throw new Error(err)
        })
      }
      else {
        Object.keys(ips).forEach(region => {
          const host = '10.' + ips[region] + '.1.255'

          ping.sys.probe(host, (isAlive) => {
            if (isAlive) {
              const subscriber = redis.createClient(
                6379,
                host
              )

              subscriber.on('ready', () => {
                subscriber.subscribe('manager')
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
