'use strict'

const http = require('http')
const jwt = require('jsonwebtoken')
const keys = require('../keys/keys')
const production = require('./config/production')
const clients = require('./database/clients')
const subscribers = require('./database/subscribers')
const timers = require('./database/timers')
const initializer = require('./initializer/initializer')
const manager = require('./manager/manager')
const createRedisClients = require('./redis/createRedisClients')
const createRedisSubscribers = require('./redis/createRedisSubscribers')
const handleError = require('./utils/handleError')
const informManager = require('./utils/informManager')

const port = process.env.NODE_ENV === 'development' ? 8082 : production.port

let server
async function startup() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Starting manager server...')
  }

  await Promise.all([createRedisClients(), createRedisSubscribers()])

  initializer()

  server = http.createServer().listen(port, () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Manager server started')
    }
  })

  server.on('request', async (req, res) => {
    try {
      if (req.headers.connection === 'Keep-alive') {
        res.writeHead(200)
        res.end()
      } else {
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, Buffer.from(keys.jwt, 'base64'))

        if (decoded.fromGame) {
          if (decoded.initialize) {
            await initializer()
          } else {
            await manager(decoded.message)
          }

          res.writeHead(200)
          res.end()
        } else {
          res.writeHead(401)
          res.end()
        }
      }
    } catch (err) {
      handleError(err, res)
    }
  })
}

startup()

process.on('unhandledRejection', async (reason, location) => {
  handleError({ reason, location })
})

process.on('SIGTERM', async () => {
  for (const client of clients.where(() => true).map(entry => entry.client)) {
    client.quit()
  }

  for (const subscriber of subscribers
    .where(() => true)
    .map(entry => entry.subscriber)) {
    subscriber.quit()
  }

  for (const timer of timers.where(() => true).map(entry => entry.timer)) {
    clearTimeout(timer)
  }

  await informManager({
    command: 'initialize',
    instance: process.env.INSTANCE_ID
  })

  server.close(() => {
    process.exit(0)
  })
})
