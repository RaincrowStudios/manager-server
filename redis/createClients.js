const lured = require('lured')
const ping = require('ping')
const redis = require('redis')
const clients = require('../database/clients')
const ips = require('../config/region-ips')
const scripts = require('../lua/scripts')

module.exports = () => {
  return new Promise((resolve, reject) => {
    try {
      Object.keys(ips).forEach(region => {
        ping.sys.probe(ips[region], (isAlive) => {
          if (isAlive) {
            const client = redis.createClient(
              6379,
              region === 'local' ? ips[region] : '10.' + ips[region] + '.1.255'
            )

            client.on('ready', () => {
              clients.insert({region: region, client: client})
              const luredClient = lured.create(client, scripts)
              luredClient.load(err => {
                if (err) {
                  //contact admin
                  throw new Error(err)
                }
              })
            })

            client.on('error', (err) => {
              const clientToRemove = clients.by('client', client)
              clients.remove(clientToRemove)
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
