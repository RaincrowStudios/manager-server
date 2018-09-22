'use strict'

const http = require('http')
const jwt = require('jsonwebtoken')
const net = require('net')
const production = require('./config/production')
const initializer = require('./initializer/initializer')
const keys = require('./keys/keys')
const manager = require('./manager/manager')
const createRedisClients = require('./redis/createRedisClients')
const createRedisSubscribers = require('./redis/createRedisSubscribers')
const handleError = require('./utils/handleError')
const informLogger = require('./utils/informLogger')

const port = process.env.NODE_ENV === 'development' ? 8082 : production.port

async function startup() {
  console.log('Starting manager server...')
  await Promise.all([
    createRedisClients(),
    createRedisSubscribers()
  ])
  initializer()
}

startup()

/*
const server = net.createServer(socket => {
  socket.on('data', data => {
    const messages = data.toString().split('$%$%').filter(message => message)

    for (const message of messages) {
      manager(JSON.parse(message))
    }
  })

  socket.on('error', err => {
    if (err.code !== 'ECONNRESET') {
      handleError(err)
    }
  })
})

server.listen(port, () => {
  console.log('Manager server started')
})
*/


const server = http.createServer().listen(port, () => {
  console.log('Manager server started')
})

server.on('request', async (req, res) => {
  try {
    if (req.headers.connection === 'Keep-alive') {
      res.writeHead(200)
      res.end()
    }
    else {
      const token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, Buffer.from(keys.jwt, 'base64'))

      if (decoded.fromGame) {
        await manager(decoded.message)

        res.writeHead(200)
        res.end()
      }
      else {
        res.writeHead(401)
        res.end()
      }
    }
  }
  catch (err) {
    handleError(err, res)
  }
})

process.on('unhandledRejection', async (reason, location) => {
  await informLogger({
    route: 'error',
    error_code: location,
    source: 'manager-server',
    content: `Unhandled Rejection at: ${location} reason: ${reason}`
  })
})
