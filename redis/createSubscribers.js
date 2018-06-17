const ping = require('ping')
const redis = require('redis')
const ips = require('../config/region-ips')

module.exports = () => {
  return new Promise((resolve, reject) => {
    try {
      Object.keys(ips).forEach(region => {
        ping.sys.probe(ips[region], (isAlive) => {
          if (isAlive) {
            const subscriber = redis.createClient(
              6379,
              region === 'local' ? ips[region] : '10.' + ips[region] + '.1.255'
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
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
