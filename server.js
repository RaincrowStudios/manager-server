'use strict'

const http = require('http')
const net = require('net')
const production = require('./config/production')
const initializer = require('./initializer/initializer')
const manager = require('./manager/manager')
const createRedisClients = require('./redis/createRedisClients')
const createRedisSubscribers = require('./redis/createRedisSubscribers')
const port = process.env.NODE_ENV === 'development' ? 8082 : production.port

async function startup() {
  console.log('Starting Manager...')
  await Promise.all([
    createRedisClients(),
    createRedisSubscribers()
  ])
  //initializer()
}

startup()

if (process.env.NODE_ENV === 'production') {
  const httpServer = http.createServer().listen(production.healthcheck)

  httpServer.on('request', (req, res) => {
    res.writeHead(200)
    res.write('OK')
    res.end()
  })
}

const server = net.createServer(socket => {
  socket.on('data', data => {
    manager(JSON.parse(data))
  })

  socket.on('error', err => {
    console.error(err)
  })
})

server.listen(port)

process.on('unhandledRejection', (reason, location) => {
  console.error('Unhandled Rejection at:', location, 'reason:', reason)
})
