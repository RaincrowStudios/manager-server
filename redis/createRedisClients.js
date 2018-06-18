const lured = require('lured')
const ping = require('ping')
const redis = require('redis')
const production = require('../config/production')
const clients = require('../database/clients')
const ips = require('../config/region-ips')
const scripts = require('../lua/scripts')

module.exports = () => {
  return new Promise(async (resolve, reject) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        const client = redis.createClient(
          6379,
          'localhost'
        )

        client.on('ready', () => {
          clients.insert({region: 'local', client: client})
          const luredClient = lured.create(client, scripts)
          luredClient.load(err => {
            if (err) {
              //contact admin
              throw new Error(err)
            }
            else {
              resolve(true)
            }
          })
        })

        client.on('error', (err) => {
          const clientToRemove = clients.by('client', client)
          if (typeof clientToRemove === 'object') {
            clients.remove(clientToRemove)
          }
          throw new Error(err)
        })
      }
      else {
        const update = []
        Object.keys(ips).forEach(region => {
          update.push(
            new Promise((resolve, reject) => {
              const host = ips[region] + production.redisAddress
              ping.sys.probe(host, (isAlive) => {
                if (isAlive) {
                  const client = redis.createClient(
                    6379,
                    host
                  )

                  client.on('ready', () => {
                    clients.insert({region: region, client: client})
                    const luredClient = lured.create(client, scripts)
                    luredClient.load(err => {
                      if (err) {
                        reject(err)
                      }
                    })
                    resolve(true)
                  })

                  client.on('error', (err) => {
                    const clientToRemove = clients.by('client', client)
                    if (typeof clientToRemove === 'object') {
                      clients.remove(clientToRemove)
                    }
                    reject(err)
                  })
                }
                else {
                  resolve(true)
                }
              })
            })
          )
        })
        await Promise.all(update)
        resolve(true)
      }
    }
    catch (err) {
      reject(err)
    }
  })
}
